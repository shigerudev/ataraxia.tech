import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/shared/supabase/client';

/*
 * Sala grupal en vivo: malla WebRTC (audio humano-a-humano) señalizada por
 * Supabase Realtime. Presence provee el roster de alias tipo Zoom/Teams;
 * Broadcast transporta las ofertas/respuestas/ICE. No hay servidor de medios:
 * cada par se conecta directamente (mesh), suficiente para grupos pequeños.
 *
 * TODO(grupal/facilitador): Fase 2 — incorporar un facilitador IA (segundo
 * agente de ElevenLabs) como participante de la sala.
 */

export type GroupRoomStatus = 'connecting' | 'connected' | 'error';

export interface GroupParticipant {
  peerId: string;
  alias: string;
  isLocal: boolean;
  muted: boolean;
  speaking: boolean;
}

export interface RemoteAudio {
  peerId: string;
  stream: MediaStream;
}

export interface GroupRoomSession {
  status: GroupRoomStatus;
  error: string | null;
  participants: GroupParticipant[];
  remoteAudios: RemoteAudio[];
  isMuted: boolean;
  toggleMute: () => void;
  leave: () => void;
}

const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];
const SPEAKING_THRESHOLD = 0.045;

interface PresenceMeta {
  peerId: string;
  alias: string;
  muted: boolean;
}

export function useGroupRoom(roomId: string, alias: string): GroupRoomSession {
  const [status, setStatus] = useState<GroupRoomStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [remoteAudios, setRemoteAudios] = useState<RemoteAudio[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  // Identidad estable de este par durante el ciclo de vida del hook.
  const peerIdRef = useRef<string>('');
  if (!peerIdRef.current) {
    peerIdRef.current =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `p_${Math.random().toString(36).slice(2)}`;
  }

  const channelRef = useRef<RealtimeChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const mutedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Analizadores por par para el indicador de "hablando".
  const analysersRef = useRef<Map<string, AnalyserNode>>(new Map());
  const speakingRef = useRef<Map<string, boolean>>(new Map());

  const leftRef = useRef(false);

  // ---- Roster (Presence -> estado) -------------------------------------
  const rebuildRoster = useCallback(() => {
    const channel = channelRef.current;
    if (!channel) return;
    const raw = channel.presenceState<PresenceMeta>();
    const seen = new Map<string, GroupParticipant>();
    for (const key of Object.keys(raw)) {
      const metas = raw[key];
      const meta = metas[metas.length - 1];
      if (!meta?.peerId) continue;
      const isLocal = meta.peerId === peerIdRef.current;
      seen.set(meta.peerId, {
        peerId: meta.peerId,
        alias: meta.alias || 'Anónimo',
        isLocal,
        muted: isLocal ? mutedRef.current : Boolean(meta.muted),
        speaking: speakingRef.current.get(meta.peerId) ?? false,
      });
    }
    const list = [...seen.values()].sort((a, b) => {
      if (a.isLocal) return -1;
      if (b.isLocal) return 1;
      return a.alias.localeCompare(b.alias);
    });
    setParticipants(list);
    return list;
  }, []);

  // ---- WebRTC ------------------------------------------------------------
  const sendSignal = useCallback(
    (to: string, kind: 'offer' | 'answer' | 'ice', data: unknown) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: { from: peerIdRef.current, to, kind, data },
      });
    },
    [],
  );

  const attachRemoteStream = useCallback((remoteId: string, stream: MediaStream) => {
    setRemoteAudios((prev) => {
      if (prev.some((a) => a.peerId === remoteId)) return prev;
      return [...prev, { peerId: remoteId, stream }];
    });
    // Analizador para el indicador de voz (best-effort).
    try {
      const ctx = audioCtxRef.current;
      if (ctx) {
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        analysersRef.current.set(remoteId, analyser);
      }
    } catch {
      /* el indicador de voz es opcional */
    }
  }, []);

  const removePeer = useCallback((remoteId: string) => {
    const pc = pcsRef.current.get(remoteId);
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
      pcsRef.current.delete(remoteId);
    }
    analysersRef.current.delete(remoteId);
    speakingRef.current.delete(remoteId);
    setRemoteAudios((prev) => prev.filter((a) => a.peerId !== remoteId));
  }, []);

  const createPeer = useCallback(
    (remoteId: string, initiator: boolean): RTCPeerConnection => {
      const existing = pcsRef.current.get(remoteId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcsRef.current.set(remoteId, pc);

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = (evt) => {
        if (evt.candidate) sendSignal(remoteId, 'ice', evt.candidate.toJSON());
      };
      pc.ontrack = (evt) => {
        attachRemoteStream(remoteId, evt.streams[0]);
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          removePeer(remoteId);
        }
      };

      if (initiator) {
        void (async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal(remoteId, 'offer', offer);
          } catch {
            /* la renegociación reintenta en el próximo sync */
          }
        })();
      }

      return pc;
    },
    [attachRemoteStream, removePeer, sendSignal],
  );

  const handleSignal = useCallback(
    async (payload: { from: string; to: string; kind: string; data: unknown }) => {
      if (payload.to !== peerIdRef.current) return;
      const remoteId = payload.from;
      try {
        if (payload.kind === 'offer') {
          const pc = createPeer(remoteId, false);
          await pc.setRemoteDescription(payload.data as RTCSessionDescriptionInit);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(remoteId, 'answer', answer);
        } else if (payload.kind === 'answer') {
          const pc = pcsRef.current.get(remoteId);
          if (pc) await pc.setRemoteDescription(payload.data as RTCSessionDescriptionInit);
        } else if (payload.kind === 'ice') {
          const pc = pcsRef.current.get(remoteId);
          if (pc) await pc.addIceCandidate(payload.data as RTCIceCandidateInit);
        }
      } catch {
        /* señal fuera de orden: se corrige en la próxima negociación */
      }
    },
    [createPeer, sendSignal],
  );

  // Conecta con los pares presentes; el par de menor id inicia (evita glare).
  const reconcilePeers = useCallback(() => {
    const list = rebuildRoster() ?? [];
    const remoteIds = new Set(list.filter((p) => !p.isLocal).map((p) => p.peerId));
    for (const remoteId of remoteIds) {
      if (!pcsRef.current.has(remoteId) && peerIdRef.current < remoteId) {
        createPeer(remoteId, true);
      }
    }
    for (const remoteId of pcsRef.current.keys()) {
      if (!remoteIds.has(remoteId)) removePeer(remoteId);
    }
  }, [createPeer, rebuildRoster, removePeer]);

  const teardown = useCallback(() => {
    leftRef.current = true;
    pcsRef.current.forEach((pc) => {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
    });
    pcsRef.current.clear();
    analysersRef.current.clear();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    void audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    const channel = channelRef.current;
    channelRef.current = null;
    if (channel) {
      void channel.untrack().catch(() => undefined);
      void getSupabase().removeChannel(channel).catch(() => undefined);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setIsMuted(next);
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !next;
    });
    void channelRef.current?.track({
      peerId: peerIdRef.current,
      alias,
      muted: next,
    } satisfies PresenceMeta);
    rebuildRoster();
  }, [alias, rebuildRoster]);

  const leave = useCallback(() => {
    teardown();
  }, [teardown]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setStatus('error');
      setError('La sala grupal requiere Supabase configurado.');
      return undefined;
    }

    leftRef.current = false;
    let cancelled = false;
    const supabase = getSupabase();
    const channel = supabase.channel(roomId, {
      config: { presence: { key: peerIdRef.current }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => reconcilePeers());
    channel.on('presence', { event: 'join' }, () => reconcilePeers());
    channel.on('presence', { event: 'leave' }, () => reconcilePeers());
    channel.on('broadcast', { event: 'signal' }, ({ payload }) => {
      void handleSignal(payload as { from: string; to: string; kind: string; data: unknown });
    });

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled || leftRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;

        try {
          const AudioCtx =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioCtxRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            analysersRef.current.set(peerIdRef.current, analyser);
          }
        } catch {
          /* indicador de voz opcional */
        }

        channel.subscribe(async (channelStatus) => {
          if (channelStatus !== 'SUBSCRIBED' || cancelled || leftRef.current) return;
          await channel.track({
            peerId: peerIdRef.current,
            alias,
            muted: mutedRef.current,
          } satisfies PresenceMeta);
          setStatus('connected');
          reconcilePeers();
        });
      } catch {
        if (!cancelled) {
          setStatus('error');
          setError('Necesitamos permiso del micrófono para unirte a la sala grupal.');
        }
      }
    })();

    return () => {
      cancelled = true;
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, alias]);

  // Detección de voz (best-effort): actualiza roster solo si algo cambia.
  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      analysersRef.current.forEach((analyser, id) => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const isLocalMuted = id === peerIdRef.current && mutedRef.current;
        const speaking = !isLocalMuted && rms > SPEAKING_THRESHOLD;
        if ((speakingRef.current.get(id) ?? false) !== speaking) {
          speakingRef.current.set(id, speaking);
          changed = true;
        }
      });
      if (changed) rebuildRoster();
    }, 250);
    return () => clearInterval(interval);
  }, [rebuildRoster]);

  return {
    status,
    error,
    participants,
    remoteAudios,
    isMuted,
    toggleMute,
    leave,
  };
}
