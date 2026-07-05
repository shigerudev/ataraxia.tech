import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/shared/supabase/client';
import {
  ELEVENLABS_AGENT_ID_GROUP,
  TURN_CREDENTIAL,
  TURN_URL,
  TURN_USERNAME,
} from '@/shared/config';
import { FacilitatorBridge } from './facilitatorBridge';

/*
 * Sala grupal en vivo: malla WebRTC (audio humano-a-humano) señalizada por
 * Supabase Realtime. Presence provee el roster de alias tipo Zoom/Teams;
 * Broadcast transporta las ofertas/respuestas/ICE. No hay servidor de medios:
 * cada par se conecta directamente (mesh), suficiente para grupos pequeños
 * (tope MAX_PARTICIPANTS).
 *
 * Facilitador IA (Fase 2, spec 006): el par con MENOR peerId presente actúa
 * como anfitrión. Conecta el agente grupal de ElevenLabs (FacilitatorBridge),
 * le envía la mezcla de toda la sala y sustituye su pista saliente por
 * mic+agente (replaceTrack, sin renegociación), de modo que todos escuchan a
 * la facilitadora a través del anfitrión. El estado (activa/hablando) viaja
 * por Broadcast para que cada cliente pinte su tarjeta en el roster. Si el
 * anfitrión sale, la elección determinista promueve al siguiente y el puente
 * renace ahí (hay un hueco breve de facilitadora durante el relevo).
 */

export type GroupRoomStatus = 'connecting' | 'connected' | 'error';

export interface GroupParticipant {
  peerId: string;
  alias: string;
  kind: 'human' | 'facilitator';
  isLocal: boolean;
  muted: boolean;
  speaking: boolean;
}

export interface RemoteAudio {
  peerId: string;
  stream: MediaStream;
}

export interface FacilitatorInfo {
  /** Hay agente grupal configurado (VITE_ELEVENLABS_AGENT_ID_GROUP). */
  configured: boolean;
  /** La facilitadora está conectada en la sala. */
  active: boolean;
  speaking: boolean;
  /** Este cliente es el anfitrión que puentea a la facilitadora. */
  isHost: boolean;
}

export interface GroupRoomSession {
  status: GroupRoomStatus;
  error: string | null;
  participants: GroupParticipant[];
  remoteAudios: RemoteAudio[];
  facilitator: FacilitatorInfo;
  isMuted: boolean;
  toggleMute: () => void;
  leave: () => void;
}

function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];
  if (TURN_URL) {
    servers.push({
      urls: TURN_URL,
      username: TURN_USERNAME || undefined,
      credential: TURN_CREDENTIAL || undefined,
    });
  }
  return servers;
}

const SPEAKING_THRESHOLD = 0.045;
/** Tope práctico de la malla (N-1 subidas por participante). */
const MAX_PARTICIPANTS = 8;
/** peerId sintético de la facilitadora en el roster (no participa en la malla). */
const FACILITATOR_PEER_ID = 'facilitator:ia';
const FACILITATOR_ALIAS = 'Ataraxia';
/** Espera antes de asumir el rol de anfitrión (deja salir al anfitrión previo). */
const HOST_GRACE_MS = 1200;
const BRIDGE_RETRY_MS = 3000;
const BRIDGE_MAX_RETRIES = 2;
/** Máximo de candidatos ICE en espera por par (contra abuso/goteo infinito). */
const MAX_PENDING_ICE = 50;

interface PresenceMeta {
  peerId: string;
  alias: string;
  muted: boolean;
}

interface FacilitatorBroadcast {
  from: string;
  active: boolean;
  speaking: boolean;
}

function micErrorMessage(err: unknown): string {
  const name = err instanceof Error ? err.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Necesitamos permiso del micrófono para unirte a la sala grupal.';
  }
  if (name === 'NotFoundError') {
    return 'No detectamos un micrófono disponible en este dispositivo.';
  }
  if (name === 'NotReadableError') {
    return 'El micrófono está en uso por otra aplicación. Ciérrala e intenta de nuevo.';
  }
  return 'No fue posible iniciar el audio de la sala grupal.';
}

export function useGroupRoom(roomId: string, alias: string): GroupRoomSession {
  const configuredAgent = Boolean(ELEVENLABS_AGENT_ID_GROUP);

  const [status, setStatus] = useState<GroupRoomStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [remoteAudios, setRemoteAudios] = useState<RemoteAudio[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [facilitatorUi, setFacilitatorUi] = useState<FacilitatorInfo>({
    configured: configuredAgent,
    active: false,
    speaking: false,
    isHost: false,
  });

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
  // Candidatos ICE llegados antes de que el par tenga remoteDescription.
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  // Streams remotos vivos (para alimentar al puente y reponer analizadores).
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());

  // ---- Facilitadora ----
  const bridgeRef = useRef<FacilitatorBridge | null>(null);
  const isHostRef = useRef(false);
  const hostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const facilitatorRef = useRef<{ hostId: string | null; active: boolean; speaking: boolean }>({
    hostId: null,
    active: false,
    speaking: false,
  });
  const knownAliasesRef = useRef<Map<string, string>>(new Map());

  const leftRef = useRef(false);
  const roomFullRef = useRef(false);

  // ---- Roster (Presence -> estado) -------------------------------------
  const rebuildRoster = useCallback((): GroupParticipant[] => {
    const channel = channelRef.current;
    if (!channel) return [];
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
        kind: 'human',
        isLocal,
        muted: isLocal ? mutedRef.current : Boolean(meta.muted),
        speaking: speakingRef.current.get(meta.peerId) ?? false,
      });
    }
    const humans = [...seen.values()].sort((a, b) => {
      if (a.isLocal) return -1;
      if (b.isLocal) return 1;
      return a.alias.localeCompare(b.alias);
    });

    // La facilitadora encabeza el roster mientras su anfitrión siga presente.
    const fac = facilitatorRef.current;
    if (fac.active && fac.hostId && !seen.has(fac.hostId)) {
      facilitatorRef.current = { hostId: null, active: false, speaking: false };
      setFacilitatorUi((prev) => ({ ...prev, active: false, speaking: false }));
    }
    const list: GroupParticipant[] =
      facilitatorRef.current.active
        ? [
            {
              peerId: FACILITATOR_PEER_ID,
              alias: FACILITATOR_ALIAS,
              kind: 'facilitator',
              isLocal: false,
              muted: false,
              speaking: facilitatorRef.current.speaking,
            },
            ...humans,
          ]
        : humans;
    setParticipants(list);
    return humans;
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

  const broadcastFacilitator = useCallback((active: boolean, speaking: boolean) => {
    facilitatorRef.current = { hostId: peerIdRef.current, active, speaking };
    setFacilitatorUi((prev) => ({ ...prev, active, speaking, isHost: isHostRef.current }));
    void channelRef.current?.send({
      type: 'broadcast',
      event: 'facilitator',
      payload: {
        from: peerIdRef.current,
        active,
        speaking,
      } satisfies FacilitatorBroadcast,
    });
    rebuildRoster();
  }, [rebuildRoster]);

  /** Pista que debe viajar a los pares: mezcla mic+agente si hay puente. */
  const outgoingTrack = useCallback((): MediaStreamTrack | null => {
    return (
      bridgeRef.current?.getMixedTrack() ??
      localStreamRef.current?.getAudioTracks()[0] ??
      null
    );
  }, []);

  const replaceOutgoingTrack = useCallback(() => {
    const track = outgoingTrack();
    if (!track) return;
    pcsRef.current.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'audio');
      void sender?.replaceTrack(track).catch(() => undefined);
    });
  }, [outgoingTrack]);

  const attachRemoteStream = useCallback((remoteId: string, stream: MediaStream) => {
    const prevStream = remoteStreamsRef.current.get(remoteId);
    if (prevStream === stream) return;
    remoteStreamsRef.current.set(remoteId, stream);
    setRemoteAudios((prev) => [
      ...prev.filter((a) => a.peerId !== remoteId),
      { peerId: remoteId, stream },
    ]);
    // Analizador para el indicador de voz (best-effort).
    analysersRef.current.delete(remoteId);
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
    // La facilitadora también debe escuchar a este par.
    if (prevStream) bridgeRef.current?.removeRemoteStream(remoteId);
    bridgeRef.current?.addRemoteStream(remoteId, stream);
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
    pendingIceRef.current.delete(remoteId);
    analysersRef.current.delete(remoteId);
    speakingRef.current.delete(remoteId);
    bridgeRef.current?.removeRemoteStream(remoteId);
    remoteStreamsRef.current.delete(remoteId);
    setRemoteAudios((prev) => prev.filter((a) => a.peerId !== remoteId));
  }, []);

  const createPeer = useCallback(
    (remoteId: string, initiator: boolean): RTCPeerConnection => {
      const existing = pcsRef.current.get(remoteId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({ iceServers: buildIceServers() });
      pcsRef.current.set(remoteId, pc);

      const stream = localStreamRef.current;
      const track = outgoingTrack();
      if (stream && track) pc.addTrack(track, stream);

      pc.onicecandidate = (evt) => {
        if (evt.candidate) sendSignal(remoteId, 'ice', evt.candidate.toJSON());
      };
      pc.ontrack = (evt) => {
        attachRemoteStream(remoteId, evt.streams[0]);
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') {
          // Deshacer y reintentar: sin esto dos pares pueden quedarse viéndose
          // en el roster sin audio para siempre.
          removePeer(remoteId);
          setTimeout(() => {
            if (!leftRef.current) reconcileRef.current?.();
          }, 0);
        } else if (pc.connectionState === 'closed') {
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
            // Dejarlo en el mapa lo volvería un muerto permanente: se retira
            // y el siguiente reconcilio lo reintenta.
            removePeer(remoteId);
            setTimeout(() => {
              if (!leftRef.current) reconcileRef.current?.();
            }, 1000);
          }
        })();
      }

      return pc;
    },
    [attachRemoteStream, outgoingTrack, removePeer, sendSignal],
  );

  const flushPendingIce = useCallback(async (remoteId: string, pc: RTCPeerConnection) => {
    const pending = pendingIceRef.current.get(remoteId);
    if (!pending) return;
    pendingIceRef.current.delete(remoteId);
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        /* candidato obsoleto */
      }
    }
  }, []);

  const handleSignal = useCallback(
    async (payload: { from: string; to: string; kind: string; data: unknown }) => {
      if (payload.to !== peerIdRef.current) return;
      if (!payload.from || payload.from === peerIdRef.current) return;
      const remoteId = payload.from;
      try {
        if (payload.kind === 'offer') {
          const pc = createPeer(remoteId, false);
          await pc.setRemoteDescription(payload.data as RTCSessionDescriptionInit);
          await flushPendingIce(remoteId, pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(remoteId, 'answer', answer);
        } else if (payload.kind === 'answer') {
          const pc = pcsRef.current.get(remoteId);
          if (pc) {
            await pc.setRemoteDescription(payload.data as RTCSessionDescriptionInit);
            await flushPendingIce(remoteId, pc);
          }
        } else if (payload.kind === 'ice') {
          const pc = pcsRef.current.get(remoteId);
          if (pc?.remoteDescription) {
            await pc.addIceCandidate(payload.data as RTCIceCandidateInit);
          } else {
            // El candidato llegó antes que la oferta/respuesta: se guarda y se
            // aplica al fijar remoteDescription (antes se perdía en silencio).
            const queue = pendingIceRef.current.get(remoteId) ?? [];
            if (queue.length < MAX_PENDING_ICE) {
              queue.push(payload.data as RTCIceCandidateInit);
              pendingIceRef.current.set(remoteId, queue);
            }
          }
        }
      } catch {
        /* señal fuera de orden: se corrige en la próxima negociación */
      }
    },
    [createPeer, flushPendingIce, sendSignal],
  );

  // ---- Puente de la facilitadora ----------------------------------------
  const stopBridge = useCallback(
    (announce: boolean) => {
      if (hostTimerRef.current) {
        clearTimeout(hostTimerRef.current);
        hostTimerRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      const bridge = bridgeRef.current;
      if (bridge) {
        bridgeRef.current = null;
        bridge.stop();
        replaceOutgoingTrack();
        if (announce && !leftRef.current) broadcastFacilitator(false, false);
      }
    },
    [broadcastFacilitator, replaceOutgoingTrack],
  );

  const startBridgeRef = useRef<() => void>(() => undefined);

  const scheduleBridgeRetry = useCallback(() => {
    if (leftRef.current || !isHostRef.current) return;
    stopBridge(true);
    if (retryCountRef.current >= BRIDGE_MAX_RETRIES) return;
    retryCountRef.current += 1;
    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = null;
      if (!leftRef.current && isHostRef.current && !bridgeRef.current) {
        startBridgeRef.current();
      }
    }, BRIDGE_RETRY_MS);
  }, [stopBridge]);

  const startBridge = useCallback(() => {
    if (leftRef.current || bridgeRef.current || !localStreamRef.current) return;
    if (!ELEVENLABS_AGENT_ID_GROUP) return;
    const bridge = new FacilitatorBridge({
      agentId: ELEVENLABS_AGENT_ID_GROUP,
      micStream: localStreamRef.current,
      onStateChange: (state) => {
        if (bridgeRef.current === bridge) {
          broadcastFacilitator(state.active, state.speaking);
        }
      },
      onError: () => undefined,
      onDisconnected: () => {
        if (bridgeRef.current === bridge) scheduleBridgeRetry();
      },
    });
    bridgeRef.current = bridge;
    void bridge
      .start()
      .then(() => {
        if (bridgeRef.current !== bridge) return;
        if (leftRef.current || !isHostRef.current) {
          stopBridge(false);
          return;
        }
        retryCountRef.current = 0;
        // La facilitadora escucha a quienes ya estaban conectados.
        remoteStreamsRef.current.forEach((stream, id) => bridge.addRemoteStream(id, stream));
        replaceOutgoingTrack();
        const aliases = [...knownAliasesRef.current.values()];
        bridge.sendContext(
          aliases.length > 0
            ? `Inicia la sesión grupal. Participantes presentes: ${alias} y ${aliases.join(', ')}.`
            : `Inicia la sesión grupal. Por ahora participa únicamente ${alias}.`,
        );
      })
      .catch(() => {
        if (bridgeRef.current === bridge) {
          bridgeRef.current = null;
          scheduleBridgeRetry();
        }
      });
  }, [alias, broadcastFacilitator, replaceOutgoingTrack, scheduleBridgeRetry, stopBridge]);

  useEffect(() => {
    startBridgeRef.current = startBridge;
  }, [startBridge]);

  /** Aplica la elección de anfitrión (menor peerId presente). */
  const reconcileFacilitator = useCallback(
    (humans: GroupParticipant[]) => {
      if (!ELEVENLABS_AGENT_ID_GROUP || leftRef.current) return;
      const ids = humans.map((p) => p.peerId).sort((a, b) => a.localeCompare(b));
      const iAmHost = ids.length > 0 && ids[0] === peerIdRef.current;
      const wasHost = isHostRef.current;
      isHostRef.current = iAmHost;
      if (iAmHost !== wasHost) {
        setFacilitatorUi((prev) => ({ ...prev, isHost: iAmHost }));
      }

      if (!iAmHost) {
        // Degradado: el nuevo anfitrión levantará su propio puente.
        if (bridgeRef.current || hostTimerRef.current || retryTimerRef.current) {
          stopBridge(true);
        }
        return;
      }

      if (bridgeRef.current || hostTimerRef.current || retryTimerRef.current) {
        // Ya hay puente o arranque en curso; avisar estado a recién llegados.
        const fac = facilitatorRef.current;
        if (bridgeRef.current?.isActive()) broadcastFacilitator(fac.active, fac.speaking);
        return;
      }

      retryCountRef.current = 0;
      // Solo en la sala: nadie más pudo haber sido anfitrión; arranque directo.
      const graceMs = humans.length <= 1 ? 0 : HOST_GRACE_MS;
      hostTimerRef.current = setTimeout(() => {
        hostTimerRef.current = null;
        if (!leftRef.current && isHostRef.current && !bridgeRef.current) startBridge();
      }, graceMs);
    },
    [broadcastFacilitator, startBridge, stopBridge],
  );

  /** Cambios de roster -> contexto no interruptivo para la facilitadora. */
  const notifyRosterChanges = useCallback((humans: GroupParticipant[]) => {
    const current = new Map(
      humans.filter((p) => !p.isLocal).map((p) => [p.peerId, p.alias] as const),
    );
    const previous = knownAliasesRef.current;
    const bridge = bridgeRef.current;
    if (bridge?.isActive()) {
      for (const [id, name] of current) {
        if (!previous.has(id)) bridge.sendContext(`Se unió a la sala: ${name}.`);
      }
      for (const [id, name] of previous) {
        if (!current.has(id)) bridge.sendContext(`Salió de la sala: ${name}.`);
      }
    }
    knownAliasesRef.current = current;
  }, []);

  // Conecta con los pares presentes; el par de menor id inicia (evita glare).
  const reconcilePeers = useCallback(() => {
    const humans = rebuildRoster();

    // Tope de la malla: los peerId excedentes (orden determinista) se retiran.
    if (humans.length > MAX_PARTICIPANTS && !roomFullRef.current) {
      const ids = humans.map((p) => p.peerId).sort((a, b) => a.localeCompare(b));
      if (ids.indexOf(peerIdRef.current) >= MAX_PARTICIPANTS) {
        roomFullRef.current = true;
        setStatus('error');
        setError(
          'La sala grupal está llena por el momento. Intenta de nuevo en unos minutos o agenda un horario.',
        );
        teardownRef.current?.();
        return;
      }
    }

    const remoteIds = new Set(humans.filter((p) => !p.isLocal).map((p) => p.peerId));
    for (const remoteId of remoteIds) {
      if (!pcsRef.current.has(remoteId) && peerIdRef.current < remoteId) {
        createPeer(remoteId, true);
      }
    }
    for (const remoteId of pcsRef.current.keys()) {
      if (!remoteIds.has(remoteId)) removePeer(remoteId);
    }

    notifyRosterChanges(humans);
    reconcileFacilitator(humans);
  }, [createPeer, notifyRosterChanges, rebuildRoster, reconcileFacilitator, removePeer]);

  const reconcileRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    reconcileRef.current = reconcilePeers;
  }, [reconcilePeers]);

  const teardown = useCallback(() => {
    leftRef.current = true;
    stopBridge(false);
    pcsRef.current.forEach((pc) => {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
    });
    pcsRef.current.clear();
    pendingIceRef.current.clear();
    remoteStreamsRef.current.clear();
    knownAliasesRef.current.clear();
    analysersRef.current.clear();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    const ctx = audioCtxRef.current;
    audioCtxRef.current = null;
    if (ctx) void ctx.close().catch(() => undefined);
    const channel = channelRef.current;
    channelRef.current = null;
    if (channel) {
      void channel.untrack().catch(() => undefined);
      void getSupabase().removeChannel(channel).catch(() => undefined);
    }
  }, [stopBridge]);

  const teardownRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    teardownRef.current = teardown;
  }, [teardown]);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setIsMuted(next);
    // Silenciar apaga la pista cruda del micrófono: la mezcla del puente (y la
    // facilitadora) reciben silencio, pero la voz de la facilitadora sigue
    // fluyendo hacia los pares.
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
    roomFullRef.current = false;
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
    channel.on('broadcast', { event: 'facilitator' }, ({ payload }) => {
      const data = payload as FacilitatorBroadcast;
      if (!data?.from || data.from === peerIdRef.current) return;
      facilitatorRef.current = {
        hostId: data.from,
        active: Boolean(data.active),
        speaking: Boolean(data.speaking),
      };
      setFacilitatorUi((prev) => ({
        ...prev,
        active: Boolean(data.active),
        speaking: Boolean(data.speaking),
        isHost: false,
      }));
      rebuildRoster();
    });

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
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
            void ctx.resume().catch(() => undefined);
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            analysersRef.current.set(peerIdRef.current, analyser);
          }
        } catch {
          /* indicador de voz opcional */
        }

        channel.subscribe(async (channelStatus, err) => {
          if (cancelled || leftRef.current) return;
          if (channelStatus === 'SUBSCRIBED') {
            await channel.track({
              peerId: peerIdRef.current,
              alias,
              muted: mutedRef.current,
            } satisfies PresenceMeta);
            setStatus('connected');
            reconcilePeers();
            return;
          }
          if (channelStatus === 'CHANNEL_ERROR' || channelStatus === 'TIMED_OUT') {
            setStatus('error');
            setError(
              err?.message ??
                'No fue posible conectar con la sala en tiempo real. Verifica tu conexión e intenta de nuevo.',
            );
          }
        });
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setError(micErrorMessage(err));
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
    facilitator: facilitatorUi,
    isMuted,
    toggleMute,
    leave,
  };
}
