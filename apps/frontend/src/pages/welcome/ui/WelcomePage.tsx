import { Button, Chip } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';

export function WelcomePage() {
  const { acceptConsent } = useTherapyFlow();

  return (
    <div className="card flex flex-col gap-5">
      <Chip className="self-start">Ataraxia</Chip>

      <h1 className="font-display font-bold text-[clamp(26px,4vw,40px)] leading-[1.12] tracking-tight">
        Un espacio para tu bienestar emocional
      </h1>

      <p className="text-muted leading-relaxed">
        Ataraxia es un acompañamiento confidencial basado en terapia
        cognitivo-conductual. Conversarás de forma anónima; no pediremos tus datos
        hasta que decidas dar el siguiente paso.
      </p>

      <div className="bg-bg rounded-md2 p-5">
        <h2 className="font-display font-semibold text-base mb-2">
          Antes de empezar, ten en cuenta:
        </h2>
        <ul className="list-disc pl-5 text-muted text-[15px] leading-relaxed space-y-1.5">
          <li>Este servicio no sustituye la atención de un profesional de salud mental.</li>
          <li>Tu conversación es privada y anónima.</li>
        </ul>
      </div>

      <Button type="button" onClick={acceptConsent} className="self-start">
        Acepto y quiero continuar
      </Button>
    </div>
  );
}
