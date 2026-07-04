import { Button } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';

export function ThankYouPage() {
  const { reset } = useTherapyFlow();

  return (
    <div className="flow-card flow-card--center">
      <span className="flow-badge">Gracias por confiar</span>
      <h1>Has dado un paso importante</h1>
      <p>
        Registramos tu preferencia. Pronto recibirás la convocatoria de tu sesión.
        Recuerda que cuidar tu salud emocional es un proceso, y no estás solo/a.
      </p>

      <div className="flow-resources">
        <h2>Mientras tanto</h2>
        <ul>
          <li>Practica una pausa de respiración de 3 minutos al día.</li>
          <li>Escribe cómo te sientes; nombrar la emoción ayuda a regularla.</li>
          <li>Si lo necesitas, vuelve a conversar cuando quieras.</li>
        </ul>
      </div>

      <Button type="button" variant="ghost" onClick={reset} className="flow-cta">
        Volver al inicio
      </Button>
    </div>
  );
}
