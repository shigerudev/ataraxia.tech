import type { CrisisInfo } from '@/entities/session';
import './CrisisOverlay.css';

export function CrisisOverlay({ crisis }: { crisis: CrisisInfo }) {
  return (
    <div className="crisis-overlay" role="alertdialog" aria-modal="true" aria-label="Apoyo prioritario">
      <div className="crisis-overlay__panel">
        <div className="crisis-overlay__icon" aria-hidden>
          ♥
        </div>
        <h1>No estás solo/a</h1>
        <p className="crisis-overlay__message">{crisis.message}</p>

        <div className="crisis-overlay__hotlines">
          {crisis.hotlines.map((line) => (
            <a key={line.phone} href={`tel:${line.phone}`} className="crisis-overlay__hotline">
              <span className="crisis-overlay__hotline-name">{line.name}</span>
              <span className="crisis-overlay__hotline-phone">{line.phone}</span>
            </a>
          ))}
        </div>

        <p className="crisis-overlay__note">
          Si estás en peligro inmediato, comunícate ahora con los servicios de
          emergencia de tu localidad.
        </p>
      </div>
    </div>
  );
}
