import { IconMicOff } from '@/shared/ui';
import type { GroupParticipant } from '../model/useGroupRoom';

function initials(alias: string): string {
  const clean = alias.trim();
  if (!clean) return '·';
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Paleta suave del sistema para diferenciar avatares por alias.
const TONES = [
  'bg-lavender text-primary-dark',
  'bg-blue-bg text-blue-text',
  'bg-green-bg text-green-text',
  'bg-pink-bg text-navy',
];

function toneFor(alias: string): string {
  let hash = 0;
  for (let i = 0; i < alias.length; i += 1) hash = (hash * 31 + alias.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

export function ParticipantTile({ participant }: { participant: GroupParticipant }) {
  const { alias, isLocal, muted, speaking } = participant;
  return (
    <div className={`room-tile ${speaking ? 'is-speaking' : ''}`}>
      <div className="relative">
        <span className={`grid h-16 w-16 place-items-center rounded-full font-display text-xl font-bold ${toneFor(alias)}`}>
          {initials(alias)}
        </span>
        {speaking && (
          <span className="absolute inset-0 rounded-full ring-4 ring-green/60 animate-pulse" aria-hidden="true" />
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-display text-sm font-semibold text-navy">
          {alias}
          {isLocal && <span className="text-muted"> (tú)</span>}
        </span>
        {muted && <IconMicOff className="h-3.5 w-3.5 text-muted" aria-label="Silenciado" />}
      </div>
    </div>
  );
}
