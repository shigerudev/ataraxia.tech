import { Button, Chip, IconCalendar, IconCheck } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';

const TIPS = [
  'Practica una pausa de respiración de 3 minutos al día.',
  'Escribe cómo te sientes; nombrar la emoción ayuda a regularla.',
  'Si lo necesitas, vuelve a conversar cuando quieras.',
];

const scheduleFormatter = new Intl.DateTimeFormat('es', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

export function ThankYouPage() {
  const { reset, joinMode, scheduledAt } = useTherapyFlow();
  const scheduledLabel =
    joinMode === 'scheduled' && scheduledAt ? scheduleFormatter.format(new Date(scheduledAt)) : null;

  return (
    <div className="card flex flex-col items-center gap-5 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-green-bg text-green-text">
        <IconCheck className="h-8 w-8" />
      </span>

      <div className="flex flex-col items-center gap-2.5">
        <Chip variant="green">Gracias por confiar</Chip>
        <h1 className="font-display font-bold text-[clamp(24px,3.5vw,36px)] tracking-tight">
          {scheduledLabel ? 'Tu sesión quedó agendada' : 'Has dado un paso importante'}
        </h1>
        <p className="leading-relaxed text-muted">
          {scheduledLabel
            ? 'Registramos tu preferencia y te enviaremos la convocatoria. Recuerda que cuidar tu salud emocional es un proceso, y no estás solo/a.'
            : 'Registramos tu preferencia. Pronto recibirás la convocatoria de tu sesión. Recuerda que cuidar tu salud emocional es un proceso, y no estás solo/a.'}
        </p>
      </div>

      {scheduledLabel && (
        <p className="flex items-center gap-2 rounded-full bg-lavender px-4 py-2 text-sm font-medium capitalize text-primary-dark">
          <IconCalendar className="h-4 w-4" />
          {scheduledLabel}
        </p>
      )}

      <div className="w-full rounded-md2 bg-bg p-5 text-left">
        <h2 className="mb-3 font-display text-base font-semibold">Mientras tanto</h2>
        <ul className="flex flex-col gap-2.5">
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-muted">
              <IconCheck className="mt-1 h-4 w-4 shrink-0 text-green-text" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <Button type="button" variant="ghost" onClick={reset} className="w-full sm:w-auto">
        Volver al inicio
      </Button>
    </div>
  );
}
