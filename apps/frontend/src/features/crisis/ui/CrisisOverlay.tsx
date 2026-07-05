import type { CrisisInfo } from '@/entities/session';

export function CrisisOverlay({ crisis }: { crisis: CrisisInfo }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-5 bg-navy/70 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-label="Apoyo prioritario"
    >
      <div className="bg-white rounded-lg2 shadow-card w-full max-w-md p-8 text-center flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 rounded-full bg-pink-bg text-pink grid place-items-center text-2xl animate-ping-soft"
          aria-hidden
        >
          ♥
        </div>

        <h1 className="font-display font-bold text-2xl tracking-tight">No estás solo/a</h1>
        <p className="text-muted leading-relaxed">{crisis.message}</p>

        <div className="w-full flex flex-col gap-2.5">
          {crisis.hotlines.map((line) => (
            <a
              key={line.phone}
              href={`tel:${line.phone}`}
              className="flex items-center justify-between gap-4 bg-blue-bg hover:bg-blue text-navy rounded-full px-5 py-3 font-medium transition"
            >
              <span>{line.name}</span>
              <span className="font-semibold">{line.phone}</span>
            </a>
          ))}
        </div>

        <p className="text-sm text-muted">
          Si estás en peligro inmediato, comunícate ahora con los servicios de
          emergencia de tu localidad.
        </p>
      </div>
    </div>
  );
}
