import { Chip, IconChat, IconMic } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';

export function ModeSelectPage() {
  const { selectMode, loading, error } = useTherapyFlow();

  return (
    <div className="card flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display font-bold text-[clamp(24px,3.5vw,34px)] tracking-tight">
          ¿Cómo prefieres empezar?
        </h1>
        <p className="text-muted">
          Elige la forma en la que te sientas más cómodo/a para conversar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          className="select-card gap-1.5"
          onClick={() => void selectMode('chat')}
          disabled={loading}
        >
          <span className="icon-tile mb-1 bg-green-bg text-green-text">
            <IconChat className="h-5 w-5" />
          </span>
          <strong className="font-display text-lg font-semibold">Por chat</strong>
          <span className="text-sm text-muted">Escribe a tu ritmo, en texto.</span>
        </button>

        <button type="button" className="select-card gap-1.5" disabled>
          <span className="icon-tile mb-1 bg-lavender text-navy">
            <IconMic className="h-5 w-5" />
          </span>
          <strong className="font-display text-lg font-semibold">Por voz</strong>
          <Chip variant="blue" className="mt-0.5 px-3 py-1 text-xs">
            Próximamente
          </Chip>
        </button>
      </div>

      {loading && (
        <p className="flex items-center gap-2.5 text-sm text-muted" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          Preparando tu espacio seguro…
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
