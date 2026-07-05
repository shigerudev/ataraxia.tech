import { Button, Chip, IconArrowRight, IconChat, IconLock, IconShield } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';

const HIGHLIGHTS = [
  {
    icon: IconLock,
    tile: 'bg-lavender text-navy',
    title: 'Anónimo y confidencial',
    text: 'No pedimos tus datos personales para conversar; tú decides cuándo compartirlos.',
  },
  {
    icon: IconChat,
    tile: 'bg-blue-bg text-blue-text',
    title: 'A tu ritmo',
    text: 'Acompañamiento basado en terapia cognitivo-conductual, disponible cuando lo necesites.',
  },
  {
    icon: IconShield,
    tile: 'bg-green-bg text-green-text',
    title: 'Un primer paso',
    text: 'Este servicio no sustituye la atención de un profesional de salud mental.',
  },
];

export function WelcomePage() {
  const { acceptConsent, loading, error } = useTherapyFlow();

  return (
    <div className="card flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Chip className="self-start">Bienestar emocional</Chip>
        <h1 className="font-display font-bold text-[clamp(26px,4vw,40px)] leading-[1.12] tracking-tight">
          Un espacio seguro para hablar de cómo te sientes
        </h1>
        <p className="text-muted leading-relaxed">
          Ataraxia es un acompañamiento confidencial basado en terapia
          cognitivo-conductual. Conversarás de forma anónima; no pediremos tus datos
          hasta que decidas dar el siguiente paso.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {HIGHLIGHTS.map(({ icon: Icon, tile, title, text }) => (
          <li
            key={title}
            className="flex items-start gap-3.5 rounded-md2 border border-hairline bg-bg/60 p-4"
          >
            <span className={`icon-tile ${tile}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <strong className="block font-display text-[15px] font-semibold">{title}</strong>
              <span className="text-sm leading-relaxed text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={() => void acceptConsent()}
          loading={loading}
          className="self-start"
        >
          Acepto y quiero continuar
          {!loading && <IconArrowRight className="h-4 w-4" />}
        </Button>
        {loading && (
          <p className="text-sm text-muted" aria-live="polite">
            Preparando tu espacio seguro…
          </p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <p className="text-xs text-muted">
          Al continuar, confirmas que conoces los alcances del servicio y aceptas
          conversar de forma anónima.
        </p>
      </div>
    </div>
  );
}
