import { useEffect, useRef, type CSSProperties } from 'react';

export type VoiceOrbState = 'connecting' | 'listening' | 'speaking' | 'demo' | 'error';

interface VoiceOrbProps {
  state: VoiceOrbState;
  /** Regresa el volumen actual 0..1. Debe ser una referencia estable
      (useCallback) para no reiniciar el bucle de animación. */
  getLevel: () => number;
}

// Suavizado del nivel: sube rápido (respuesta inmediata a la voz) y baja
// lento (sin parpadeo entre sílabas). Calibrables.
const ATTACK = 0.35;
const DECAY = 0.12;

/**
 * Orbe decorativo del modo voz. Escribe --voice-level vía requestAnimationFrame
 * directamente en el DOM (cero re-renders de React). Bajo prefers-reduced-motion
 * el CSS congela las escalas y solo la opacidad del halo sigue a la voz.
 */
export function VoiceOrb({ state, getLevel }: VoiceOrbProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef(0);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;

    // Estados sin señal: nivel fijo en 0, sin bucle activo.
    if (state === 'connecting' || state === 'error') {
      shownRef.current = 0;
      node.style.setProperty('--voice-level', '0');
      return undefined;
    }

    let raf = 0;
    const tick = () => {
      const target = Math.min(1, Math.max(0, getLevel()));
      const k = target > shownRef.current ? ATTACK : DECAY;
      shownRef.current += (target - shownRef.current) * k;
      if (Math.abs(target - shownRef.current) < 0.001) shownRef.current = target;
      node.style.setProperty('--voice-level', shownRef.current.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state, getLevel]);

  return (
    <div
      ref={rootRef}
      className={`voice-orb voice-orb--${state}`}
      style={{ '--voice-level': 0 } as CSSProperties}
      aria-hidden="true"
    >
      <span className="voice-orb__ring voice-orb__ring--far" />
      <span className="voice-orb__ring" />
      <span className="voice-orb__halo" />
      <span className="voice-orb__breath">
        <span className="voice-orb__core">
          <span className="voice-orb__sheen" />
        </span>
      </span>
    </div>
  );
}
