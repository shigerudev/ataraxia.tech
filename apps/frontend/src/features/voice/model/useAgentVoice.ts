import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useConversationControls,
  useConversationInput,
  useConversationMode,
  useConversationStatus,
} from '@elevenlabs/react';
import { assertMicSupport, micErrorMessage } from './micSupport';
import type { VoiceSession, VoiceStatus } from './types';

/*
 * Conversación de voz real vía ElevenLabs Agents. Debe usarse dentro del
 * ConversationProvider que monta VoiceOverlay (el agentId público viaja en
 * las props del provider; ver VITE_ELEVENLABS_AGENT_ID).
 *
 * TODO(voz/crisis): esta conversación NO pasa por el clasificador de crisis
 * del backend (que opera sobre los mensajes SSE del chat de texto). Resolver
 * a futuro: reenviar transcripciones al backend o usar una client tool /
 * webhook del agente.
 * TODO(voz/privado): para agentes privados, sustituir el agentId por una
 * signed URL generada por el backend (GET https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=...,
 * encabezado xi-api-key) y pasarla en startSession({ signedUrl }). La API key
 * jamás debe llegar al frontend.
 * TODO(voz/visual): getOutputByteFrequencyData() (banda de voz 100-8000 Hz)
 * permitiría una animación espectral más rica que el volumen escalar.
 */

type Phase = 'idle' | 'requesting-mic' | 'started' | 'ended' | 'error';

function sdkErrorMessage(message: string | undefined): string {
  return message?.trim() || 'Se perdió la conexión con el agente de voz.';
}

function disconnectErrorMessage(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;
  const record = details as Record<string, unknown>;
  if (record.reason !== 'error') return null;
  return sdkErrorMessage(typeof record.message === 'string' ? record.message : undefined);
}

export function useAgentVoice(): VoiceSession {
  const { startSession, endSession, getInputVolume, getOutputVolume } = useConversationControls();
  const { status: sdkStatus, message: sdkMessage } = useConversationStatus();
  const { isSpeaking } = useConversationMode();
  const { isMuted, setMuted } = useConversationInput();

  const [phase, setPhase] = useState<Phase>('idle');
  const [localError, setLocalError] = useState<string | null>(null);
  const connectedOnceRef = useRef(false);
  const startSessionRef = useRef(startSession);
  const endSessionRef = useRef(endSession);
  // Generación: invalida arranques en curso ante stop/reintento (y el doble
  // montaje de StrictMode) para no iniciar sesiones duplicadas.
  const genRef = useRef(0);

  startSessionRef.current = startSession;
  endSessionRef.current = endSession;

  if (sdkStatus === 'connected') connectedOnceRef.current = true;

  const stop = useCallback(async () => {
    genRef.current += 1;
    endSessionRef.current();
    setPhase('ended');
  }, []);

  const start = useCallback(async () => {
    const gen = ++genRef.current;
    setLocalError(null);
    connectedOnceRef.current = false;
    try {
      assertMicSupport();
      if (gen !== genRef.current) return;
      startSessionRef.current({
        onConnect: () => {
          if (gen !== genRef.current) return;
          connectedOnceRef.current = true;
        },
        onDisconnect: (details) => {
          if (gen !== genRef.current) return;
          const message = disconnectErrorMessage(details);
          if (message) {
            setLocalError(message);
            setPhase('error');
            return;
          }
          setPhase('ended');
        },
        onError: (message) => {
          if (gen !== genRef.current) return;
          setLocalError(sdkErrorMessage(message));
          setPhase('error');
        },
      });
      setPhase('started');
    } catch (err) {
      if (gen !== genRef.current) return;
      setLocalError(micErrorMessage(err));
      setPhase('error');
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  const getLevel = useCallback(() => {
    const level = Math.max(getInputVolume(), getOutputVolume());
    return Math.min(1, Math.max(0, level));
  }, [getInputVolume, getOutputVolume]);

  // Auto-inicio al montar y colgado garantizado al desmontar.
  useEffect(() => {
    void start();
    return () => {
      genRef.current += 1;
      endSessionRef.current();
    };
  }, [start]);

  let status: VoiceStatus;
  if (phase === 'error' || sdkStatus === 'error') status = 'error';
  else if (phase === 'requesting-mic') status = 'requesting-mic';
  else if (phase === 'ended') status = 'ended';
  else if (phase === 'started') {
    if (sdkStatus === 'connected') status = 'active';
    else if (sdkStatus === 'connecting') status = 'connecting';
    // 'disconnected' antes de conectar = aún estableciendo; después = colgado.
    else status = connectedOnceRef.current ? 'ended' : 'connecting';
  } else status = 'idle';

  const error =
    localError ??
    (sdkStatus === 'error'
      ? (sdkMessage ?? 'Se perdió la conexión con el agente de voz.')
      : null);

  return {
    mode: 'agent',
    status,
    isSpeaking: status === 'active' && isSpeaking,
    isMuted,
    error,
    start,
    stop,
    toggleMute,
    getLevel,
  };
}
