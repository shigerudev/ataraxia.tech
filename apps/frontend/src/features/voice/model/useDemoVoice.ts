import { useCallback, useEffect, useRef, useState } from 'react';
import { assertMicSupport, micErrorMessage } from './micSupport';
import type { VoiceSession, VoiceStatus } from './types';

/**
 * Modo demostración: captura el micrófono local únicamente para animar el
 * orbe (Web Audio + AnalyserNode). No hay conversación real; el modo con
 * agente vive en useAgentVoice y se activa con VITE_ELEVENLABS_AGENT_ID.
 */
export function useDemoVoice(): VoiceSession {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);
  const levelRef = useRef(0);
  const mutedRef = useRef(false);
  // Generación: invalida arranques en curso ante stop/reintento (y el doble
  // montaje de StrictMode) para no dejar micrófonos abiertos.
  const genRef = useRef(0);

  const stop = useCallback(async () => {
    genRef.current += 1;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    levelRef.current = 0;
    const ctx = ctxRef.current;
    ctxRef.current = null;
    if (ctx && ctx.state !== 'closed') {
      try {
        await ctx.close();
      } catch {
        // ya estaba cerrado
      }
    }
    setStatus((prev) => (prev === 'error' ? prev : 'ended'));
  }, []);

  const start = useCallback(async () => {
    const gen = ++genRef.current;
    setError(null);
    try {
      assertMicSupport();
      setStatus('requesting-mic');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (gen !== genRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();
      if (gen !== genRef.current) return; // stop() ya liberó todo

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (const value of data) sum += value * value;
        const rms = Math.sqrt(sum / data.length) / 255;
        levelRef.current = mutedRef.current ? 0 : Math.min(1, rms * 2.2);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      setStatus('active');
    } catch (err) {
      if (gen !== genRef.current) return;
      await stop();
      setError(micErrorMessage(err));
      setStatus('error');
    }
  }, [stop]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      streamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = !next;
      });
      if (next) levelRef.current = 0;
      return next;
    });
  }, []);

  const getLevel = useCallback(() => levelRef.current, []);

  // Auto-inicio al montar y liberación garantizada al desmontar.
  useEffect(() => {
    void start();
    return () => {
      void stop();
    };
  }, [start, stop]);

  return {
    mode: 'demo',
    status,
    isSpeaking: false,
    isMuted,
    error,
    start,
    stop,
    toggleMute,
    getLevel,
  };
}
