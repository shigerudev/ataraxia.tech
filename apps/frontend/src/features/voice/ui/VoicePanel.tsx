import { useEffect, useRef, type KeyboardEvent } from 'react';
import { IconMic, IconMicOff, IconPhone } from '@/shared/ui';
import type { VoiceSession } from '../model/types';
import { VoiceOrb, type VoiceOrbState } from './VoiceOrb';

interface VoicePanelProps {
  session: VoiceSession;
  onClose: () => void;
}

function orbState(session: VoiceSession): VoiceOrbState {
  switch (session.status) {
    case 'error':
      return 'error';
    case 'active':
      if (session.isSpeaking) return 'speaking';
      return session.mode === 'demo' ? 'demo' : 'listening';
    default:
      return 'connecting';
  }
}

function statusText(session: VoiceSession): string {
  switch (session.status) {
    case 'requesting-mic':
      return 'Esperando acceso al micrófono…';
    case 'active':
      return session.isSpeaking ? 'Ataraxia está hablando…' : 'Te escucho…';
    case 'error':
      return 'No fue posible iniciar el modo de voz.';
    case 'ended':
      return 'Conversación finalizada.';
    default:
      return 'Conectando…';
  }
}

/**
 * Panel presentacional del modo voz (compartido por los modos agente y demo).
 * Diálogo modal sobre la tarjeta del chat: sin cierre por clic en el fondo
 * (colgar debe ser deliberado); Escape sí cuelga.
 */
export function VoicePanel({ session, onClose }: VoicePanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Cierra el overlay cuando la sesión termina (colgó el usuario o el agente).
  useEffect(() => {
    if (session.status === 'ended') onClose();
  }, [session.status, onClose]);

  // Foco inicial en el primer control disponible.
  useEffect(() => {
    rootRef.current?.querySelector<HTMLElement>('button:not([disabled])')?.focus();
  }, []);

  function endCall() {
    void session.stop();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      endCall();
      return;
    }
    if (event.key !== 'Tab') return;
    // Trampa de foco mínima dentro del diálogo.
    const focusables = rootRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
    if (!focusables?.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const state = orbState(session);

  return (
    <div
      ref={rootRef}
      className="voice-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Conversación por voz con Ataraxia"
      onKeyDown={handleKeyDown}
    >
      <VoiceOrb state={state} getLevel={session.getLevel} />

      <div aria-live="polite" className="flex flex-col items-center gap-2.5">
        <p className="font-display text-xl font-semibold tracking-tight text-white">
          {statusText(session)}
        </p>
        {session.mode === 'demo' && session.status !== 'error' && (
          <span className="chip-veil">Modo demostración — la voz aún no está conectada</span>
        )}
        {session.status === 'error' && (
          <p className="max-w-xs text-sm leading-relaxed text-lavender/90">
            {session.error ?? 'Revisa los permisos del micrófono en tu navegador e intenta de nuevo.'}
          </p>
        )}
      </div>

      {session.status === 'error' ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="btn--light px-5 py-2.5 text-sm"
            onClick={() => void session.start()}
          >
            Reintentar
          </button>
          <button type="button" className="btn--ghost px-5 py-2.5 text-sm" onClick={endCall}>
            Volver al chat
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={session.toggleMute}
              aria-pressed={session.isMuted}
              aria-label={session.isMuted ? 'Reactivar micrófono' : 'Silenciar micrófono'}
              className={`btn-voice ${session.isMuted ? 'is-muted' : ''}`}
            >
              {session.isMuted ? <IconMicOff className="h-5 w-5" /> : <IconMic className="h-5 w-5" />}
            </button>
            <span className="text-[11px] font-medium text-lavender/80" aria-hidden="true">
              {session.isMuted ? 'Reactivar' : 'Silenciar'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={endCall}
              aria-label="Terminar conversación por voz"
              className="btn-voice btn-voice--danger"
            >
              <IconPhone className="h-5 w-5 rotate-[135deg]" />
            </button>
            <span className="text-[11px] font-medium text-lavender/80" aria-hidden="true">
              Colgar
            </span>
          </div>
        </div>
      )}

      <p className="text-xs text-lavender/80">Al terminar, regresarás a la conversación por texto.</p>
    </div>
  );
}
