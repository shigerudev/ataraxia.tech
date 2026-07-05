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
  const genRef = useRef(0);

  if (sdkStatus === 'connected') connectedOnceRef.current = true;

  const stop = useCallback(() => {
    genRef.current += 1;
    endSession();
    setPhase('ended');
  }, [endSession]);

  const start = useCallback(async () => {
    const gen = ++genRef.current;
    setLocalError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('mic-unsupported');
      }
      setPhase('requesting-mic');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      if (gen !== genRef.current) return;
      startSession();
      setPhase('started');
    } catch (err) {
      if (gen !== genRef.current) return;
      setLocalError(micErrorMessage(err));
      setPhase('error');
    }
  }, [startSession]);

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
      endSession();
    };
  }, [start, endSession]);

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
