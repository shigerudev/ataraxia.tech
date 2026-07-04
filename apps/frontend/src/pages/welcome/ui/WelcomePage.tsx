import { Button } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';

export function WelcomePage() {
  const { acceptConsent } = useTherapyFlow();

  return (
    <div className="flow-card">
      <span className="flow-badge">Ataraxia</span>
      <h1>Un espacio para tu bienestar emocional</h1>
      <p>
        Ataraxia es un acompañamiento confidencial basado en terapia
        cognitivo-conductual. Conversarás de forma anónima; no pediremos tus datos
        hasta que decidas dar el siguiente paso.
      </p>

      <div className="flow-consent">
        <h2>Antes de empezar, ten en cuenta:</h2>
        <ul>
          <li>Este servicio no sustituye la atención de un profesional de salud mental.</li>
          <li>Tu conversación es privada y anónima.</li>
        </ul>
      </div>

      <Button type="button" onClick={acceptConsent} className="flow-cta">
        Acepto y quiero continuar
      </Button>
    </div>
  );
}
