import type { ReactNode } from 'react';
import {
  BrandMark,
  IconMic,
  IconMicOff,
  IconPhoneOff,
} from '@/shared/ui';

interface RoomShellProps {
  title: string;
  subtitle?: string;
  /** Muestra el indicador "En vivo" pulsante. */
  live?: boolean;
  /** Texto a la derecha del header (p.ej. conteo de participantes). */
  meta?: ReactNode;
  children: ReactNode;
  /** Controles de micrófono. Omitir para ocultar el botón de silencio. */
  isMuted?: boolean;
  onToggleMute?: () => void;
  micDisabled?: boolean;
  onLeave: () => void;
  leaveLabel?: string;
}

/**
 * Contenedor a pantalla completa para las salas de acompañamiento (individual y
 * grupal). Mantiene el estilo "Sinapsis": fondo aurora, superficies claras y la
 * barra de control inferior tipo reunión (silenciar / salir).
 */
export function RoomShell({
  title,
  subtitle,
  live = false,
  meta,
  children,
  isMuted,
  onToggleMute,
  micDisabled = false,
  onLeave,
  leaveLabel = 'Salir',
}: RoomShellProps) {
  return (
    <div className="room-shell" role="dialog" aria-modal="true" aria-label={title}>
      <header className="room-header">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white" aria-hidden="true">
            <BrandMark className="h-5 w-5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="flex items-center gap-2 font-display font-bold text-navy">
              {title}
              {live && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-bg px-2.5 py-0.5 text-[11px] font-semibold text-green-text">
                  <span className="h-2 w-2 animate-ping-green rounded-full bg-green" />
                  En vivo
                </span>
              )}
            </span>
            {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
          </div>
        </div>
        {meta && <div className="text-sm font-medium text-muted">{meta}</div>}
      </header>

      <main className="room-body">{children}</main>

      <footer className="room-controls">
        {onToggleMute && (
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              disabled={micDisabled}
              aria-pressed={isMuted}
              aria-label={isMuted ? 'Reactivar micrófono' : 'Silenciar micrófono'}
              className={`btn-voice ${isMuted ? 'is-muted' : ''}`}
            >
              {isMuted ? <IconMicOff className="h-5 w-5" /> : <IconMic className="h-5 w-5" />}
            </button>
            <span className="text-[11px] font-medium text-muted" aria-hidden="true">
              {isMuted ? 'Reactivar' : 'Silenciar'}
            </span>
          </div>
        )}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onLeave}
            aria-label={leaveLabel}
            className="btn-voice btn-voice--danger"
          >
            <IconPhoneOff className="h-5 w-5" />
          </button>
          <span className="text-[11px] font-medium text-muted" aria-hidden="true">
            {leaveLabel}
          </span>
        </div>
      </footer>
    </div>
  );
}
