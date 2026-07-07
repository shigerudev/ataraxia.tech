import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useConversationControls,
  useConversationInput,
  useConversationMode,
  useConversationStatus,
} from '@elevenlabs/react';

/*
 * Conversación de voz de la SALA individual vía ElevenLabs Agents. Debe usarse
 * dentro del ConversationProvider (el agentId viaja en las props del provider;
 * ver VITE_ELEVENLABS_AGENT_ID_INDIVIDUAL). Es análogo al modo de voz del chat
 * pero autónomo dentro del slice `room` para respetar los límites de FSD.
 *
 * TODO(sala/privado): para agentes privados, sustituir el agentId por una signed
 * URL generada por el backend (xi-api-key jamás en el frontend).
 */

export type RoomVoiceStatus = 'connecting' | 'active' | 'ended' | 'error';

export interface RoomVoiceSession {
  status: RoomVoiceStatus;
  isSpeaking: boolean;
  isMuted: boolean;
  error: string | null;
  stop: () => void;
  toggleMute: () => void;
  getLevel: () => number;
}

type Phase = 'idle' | 'requesting-mic' | 'started' | 'ended' | 'error';

function sdkErrorMessage(message: string | undefined): string {
  return message?.trim() || 'Se perdió la conexión con la sala.';
}

function disconnectErrorMessage(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;
  const record = details as Record<string, unknown>;
  if (record.reason !== 'error') return null;
  return sdkErrorMessage(typeof record.message === 'string' ? record.message : undefined);
}

function micErrorMessage(err: unknown): string {
  const name = err instanceof Error ? err.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Necesitamos permiso del micrófono. Revisa los permisos del navegador e intenta de nuevo.';
  }
  if (name === 'NotFoundError') {
    return 'No detectamos un micrófono disponible en este dispositivo.';
  }
  return 'No fue posible iniciar el audio de la sala.';
}

export function useRoomVoice(): RoomVoiceSession {
  const { startSession, endSession, getInputVolume, getOutputVolume } = useConversationControls();
  const { status: sdkStatus, message: sdkMessage } = useConversationStatus();
  const { isSpeaking } = useConversationMode();
  const { isMuted, setMuted } = useConversationInput();

  const [phase, setPhase] = useState<Phase>('idle');
  const [localError, setLocalError] = useState<string | null>(null);
  const connectedOnceRef = useRef(false);
  const startSessionRef = useRef(startSession);
  const endSessionRef = useRef(endSession);
  const genRef = useRef(0);

  startSessionRef.current = startSession;
  endSessionRef.current = endSession;

  if (sdkStatus === 'connected') connectedOnceRef.current = true;

  const stop = useCallback(() => {
    genRef.current += 1;
    endSessionRef.current();
    setPhase('ended');
  }, []);

  const start = useCallback(async () => {
    const gen = ++genRef.current;
    setLocalError(null);
    connectedOnceRef.current = false;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('mic-unsupported');
      }
      setPhase('requesting-mic');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      if (gen !== genRef.current) return;
      // startSession es fire-and-forget: los fallos de conexión llegan por
      // useConversationStatus (status 'error'), ya mapeado abajo.
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

  useEffect(() => {
    void start();
    return () => {
      genRef.current += 1;
      endSessionRef.current();
    };
  }, [start]);

  let status: RoomVoiceStatus;
  if (phase === 'error' || sdkStatus === 'error') status = 'error';
  else if (phase === 'ended') status = 'ended';
  else if (phase === 'started' && sdkStatus === 'connected') status = 'active';
  else if (phase === 'started' && sdkStatus === 'disconnected' && connectedOnceRef.current)
    status = 'ended';
  else status = 'connecting';

  const error =
    localError ??
    (sdkStatus === 'error' ? (sdkMessage ?? 'Se perdió la conexión con la sala.') : null);

  return {
    status,
    isSpeaking: status === 'active' && isSpeaking,
    isMuted,
    error,
    stop,
    toggleMute,
    getLevel,
  };
}
