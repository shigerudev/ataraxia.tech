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

      <div className="grid sm:grid-cols-2 gap-4">
        <button
          type="button"
          className="select-card"
          onClick={() => void selectMode('chat')}
          disabled={loading}
        >
          <span
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-green to-blue grid place-items-center text-xl mb-1"
            aria-hidden
          >
            💬
          </span>
          <strong className="font-display font-semibold text-lg">Por chat</strong>
          <span className="text-muted text-sm">Escribe a tu ritmo, en texto.</span>
        </button>

        <button
          type="button"
          className="select-card opacity-55 cursor-not-allowed hover:translate-y-0 hover:border-hairline"
          disabled
        >
          <span
            className="w-11 h-11 rounded-xl bg-lavender grid place-items-center text-xl mb-1"
            aria-hidden
          >
            🎙️
          </span>
          <strong className="font-display font-semibold text-lg">Por voz</strong>
          <span className="text-muted text-sm">Próximamente</span>
        </button>
      </div>

      {loading && <p className="text-muted text-sm">Preparando tu espacio seguro…</p>}
      {error && (
        <p className="text-pink font-medium text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
