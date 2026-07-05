import { Button, Chip } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';

export function ThankYouPage() {
  const { reset } = useTherapyFlow();

  return (
    <div className="card flex flex-col items-center text-center gap-5">
      <Chip variant="green">Gracias por confiar</Chip>

      <h1 className="font-display font-bold text-[clamp(24px,3.5vw,36px)] tracking-tight">
        Has dado un paso importante
      </h1>

      <p className="text-muted leading-relaxed">
        Registramos tu preferencia. Pronto recibirás la convocatoria de tu sesión.
        Recuerda que cuidar tu salud emocional es un proceso, y no estás solo/a.
      </p>

      <div className="bg-bg rounded-md2 p-5 text-left w-full">
        <h2 className="font-display font-semibold text-base mb-2">Mientras tanto</h2>
        <ul className="list-disc pl-5 text-muted text-[15px] leading-relaxed space-y-1.5">
          <li>Practica una pausa de respiración de 3 minutos al día.</li>
          <li>Escribe cómo te sientes; nombrar la emoción ayuda a regularla.</li>
          <li>Si lo necesitas, vuelve a conversar cuando quieras.</li>
        </ul>
      </div>

      <Button type="button" variant="ghost" onClick={reset}>
        Volver al inicio
      </Button>
    </div>
  );
}
