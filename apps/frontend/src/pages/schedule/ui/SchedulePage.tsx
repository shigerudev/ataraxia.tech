import { useMemo, useState } from 'react';
import {
  Button,
  Chip,
  IconArrowRight,
  IconCalendar,
  IconClock,
  IconUser,
  IconUsers,
  IconVideo,
} from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';

const TIME_SLOTS = ['09:00', '11:00', '13:00', '16:00', '18:00', '20:00'] as const;
const DAYS_AHEAD = 7;

const dayLabel = new Intl.DateTimeFormat('es', { weekday: 'short' });
const dateLabel = new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short' });
const fullLabel = new Intl.DateTimeFormat('es', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

interface DayOption {
  key: string;
  date: Date;
  weekday: string;
  day: string;
}

function buildDays(): DayOption[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      key: date.toISOString().slice(0, 10),
      date,
      weekday: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : dayLabel.format(date),
      day: dateLabel.format(date),
    };
  });
}

function toIso(dayKey: string, slot: string): string {
  const [hh, mm] = slot.split(':').map(Number);
  const date = new Date(`${dayKey}T00:00:00`);
  date.setHours(hh, mm, 0, 0);
  return date.toISOString();
}

export function SchedulePage() {
  const { modalidad, joinNow, scheduleForLater, loading, error } = useTherapyFlow();
  const days = useMemo(buildDays, []);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [pending, setPending] = useState<'now' | 'later' | null>(null);

  const isGroup = modalidad === 'grupal';
  const canSchedule = Boolean(selectedDay && selectedSlot) && !loading;

  const selectedSummary = useMemo(() => {
    if (!selectedDay || !selectedSlot) return null;
    const day = days.find((d) => d.key === selectedDay);
    if (!day) return null;
    return `${fullLabel.format(day.date)} · ${selectedSlot} h`;
  }, [days, selectedDay, selectedSlot]);

  async function handleJoinNow() {
    setPending('now');
    await joinNow();
  }

  async function handleSchedule() {
    if (!selectedDay || !selectedSlot) return;
    setPending('later');
    await scheduleForLater(toIso(selectedDay, selectedSlot));
  }

  return (
    <div className="card flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Chip className="self-start" variant={isGroup ? 'blue' : 'brand'}>
          {isGroup ? (
            <>
              <IconUsers className="h-3.5 w-3.5" /> Sesión grupal
            </>
          ) : (
            <>
              <IconUser className="h-3.5 w-3.5" /> Sesión individual
            </>
          )}
        </Chip>
        <h1 className="font-display font-bold text-[clamp(24px,3.5vw,32px)] tracking-tight">
          Agenda tu sesión
        </h1>
        <p className="leading-relaxed text-muted">
          {isGroup
            ? 'Únete ahora a una sala grupal en vivo o reserva un horario para más adelante. Participarás con tu alias, sin revelar tu identidad.'
            : 'Puedes empezar ahora mismo tu sesión de acompañamiento o elegir un día y hora que te acomode.'}
        </p>
      </header>

      {/* Unirse ahora */}
      <button
        type="button"
        onClick={() => void handleJoinNow()}
        disabled={loading}
        className="select-card is-active flex-row items-center gap-4 p-5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="icon-tile h-12 w-12 bg-brand text-white">
          <IconVideo className="h-6 w-6" />
        </span>
        <span className="flex flex-1 flex-col">
          <strong className="font-display text-[17px] font-semibold text-navy">
            Unirme ahora mismo
          </strong>
          <span className="text-sm text-muted">
            {isGroup
              ? 'Entra a la sala en vivo y comparte con quienes ya están dentro.'
              : 'Comienza de inmediato tu conversación de voz.'}
          </span>
        </span>
        {loading && pending === 'now' ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 animate-spin text-primary" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        ) : (
          <IconArrowRight className="h-5 w-5 shrink-0 text-primary" />
        )}
      </button>

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-hairline" />
        o resérvala para después
        <span className="h-px flex-1 bg-hairline" />
      </div>

      {/* Selección de día */}
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2.5 flex items-center gap-2 text-sm font-medium text-ink">
          <IconCalendar className="h-4 w-4 text-primary-dark" /> Elige un día
        </legend>
        <div className="flex flex-wrap gap-2">
          {days.map((d) => {
            const active = selectedDay === d.key;
            return (
              <button
                key={d.key}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedDay(d.key)}
                className={`flex min-w-[68px] flex-col items-center rounded-md2 border px-3 py-2.5 transition ${
                  active
                    ? 'border-primary bg-lavender/60 text-primary-dark'
                    : 'border-hairline bg-white text-navy hover:border-primary hover:bg-lavender/30'
                }`}
              >
                <span className="text-xs font-medium capitalize">{d.weekday}</span>
                <span className="font-display text-sm font-semibold capitalize">{d.day}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Selección de hora */}
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2.5 flex items-center gap-2 text-sm font-medium text-ink">
          <IconClock className="h-4 w-4 text-primary-dark" /> Elige una hora
        </legend>
        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map((slot) => {
            const active = selectedSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? 'border-primary bg-brand text-white'
                    : 'border-hairline bg-white text-navy hover:border-primary hover:bg-lavender/30'
                }`}
              >
                {slot} h
              </button>
            );
          })}
        </div>
      </fieldset>

      {selectedSummary && (
        <p className="rounded-md2 bg-bg px-4 py-3 text-sm text-ink">
          Reservarás para el <strong className="font-semibold capitalize">{selectedSummary}</strong>.
          Te enviaremos la convocatoria.
        </p>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <Button
        type="button"
        onClick={() => void handleSchedule()}
        disabled={!canSchedule}
        loading={loading && pending === 'later'}
        variant="light"
        className="self-stretch sm:self-start"
      >
        Reservar este horario
        {!(loading && pending === 'later') && <IconArrowRight className="h-4 w-4" />}
      </Button>
    </div>
  );
}
