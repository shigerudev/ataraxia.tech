import type { CrisisInfo } from '@/entities/session';
import { IconHeart, IconPhone } from '@/shared/ui';

export function CrisisOverlay({ crisis }: { crisis: CrisisInfo }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-navy/70 p-5 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-label="Apoyo prioritario"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg2 bg-white p-8 text-center shadow-card">
        <div
          className="grid h-16 w-16 animate-ping-soft place-items-center rounded-full bg-pink-bg text-pink"
          aria-hidden="true"
        >
          <IconHeart className="h-7 w-7" />
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight">No estás solo/a</h1>
        <p className="leading-relaxed text-muted">{crisis.message}</p>

        <div className="flex w-full flex-col gap-2.5">
          {crisis.hotlines.map((line) => (
            <a
              key={line.phone}
              href={`tel:${line.phone}`}
              className="flex items-center justify-between gap-4 rounded-full bg-blue-bg px-5 py-3 font-medium text-navy transition hover:bg-blue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/20"
            >
              <span className="inline-flex items-center gap-2.5">
                <IconPhone className="h-4 w-4" />
                {line.name}
              </span>
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
