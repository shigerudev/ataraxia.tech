import { useTherapyFlow } from '@/features/session';

export function ModeSelectPage() {
  const { selectMode, loading, error } = useTherapyFlow();

  return (
    <div className="flow-card">
      <h1>¿Cómo prefieres empezar?</h1>
      <p>Elige la forma en la que te sientas más cómodo/a para conversar.</p>

      <div className="mode-grid">
        <button
          type="button"
          className="mode-option"
          onClick={() => void selectMode('chat')}
          disabled={loading}
        >
          <span className="mode-option__icon" aria-hidden>
            💬
          </span>
          <strong>Por chat</strong>
          <span className="mode-option__desc">Escribe a tu ritmo, en texto.</span>
        </button>

        <button type="button" className="mode-option mode-option--disabled" disabled>
          <span className="mode-option__icon" aria-hidden>
            🎙️
          </span>
          <strong>Por voz</strong>
          <span className="mode-option__desc">Próximamente</span>
        </button>
      </div>

      {loading && <p className="flow-hint">Preparando tu espacio seguro…</p>}
      {error && (
        <p className="flow-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
