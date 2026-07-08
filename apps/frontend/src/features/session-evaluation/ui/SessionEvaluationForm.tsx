import { FormEvent, useState } from 'react';
import {
  Button,
  Chip,
  IconArrowRight,
  IconCheck,
  IconHeart,
  IconShield,
} from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';
import type { SessionEvaluationPayload } from '@/features/session';

type AnswerValue = string;

interface Option {
  value: AnswerValue;
  label: string;
}

interface Question {
  key: keyof Omit<SessionEvaluationPayload, 'trustImprovement' | 'submittedAt'>;
  title: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    key: 'comfort',
    title: '¿Cómo te sentiste usando Ataraxia?',
    options: [
      { value: 'comfortable', label: 'Cómodo/a' },
      { value: 'neutral', label: 'Neutral' },
      { value: 'uncomfortable', label: 'Incómodo/a' },
    ],
  },
  {
    key: 'feltHeard',
    title: '¿Sentiste que Ataraxia te escuchó y entendió?',
    options: [
      { value: 'yes', label: 'Sí' },
      { value: 'somewhat', label: 'Más o menos' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'responseQualityIssue',
    title: '¿Hubo alguna respuesta repetitiva, fría o fuera de lugar?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Sí' },
    ],
  },
  {
    key: 'helpedOrganize',
    title: '¿Te ayudó a ordenar lo que sentías?',
    options: [
      { value: 'yes', label: 'Sí' },
      { value: 'somewhat', label: 'Un poco' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'wouldUseInRealMoment',
    title: '¿Usarías Ataraxia en un momento real de ansiedad, tristeza o confusión?',
    options: [
      { value: 'yes', label: 'Sí' },
      { value: 'somewhat', label: 'Tal vez' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'understandsProfessionalLimit',
    title: '¿Te quedó claro que Ataraxia no reemplaza a un profesional?',
    options: [
      { value: 'yes', label: 'Sí' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'valueSignal',
    title: 'Después de probarlo, ¿cómo lo usarías?',
    options: [
      { value: 'real_need', label: 'Cuando me siento mal' },
      { value: 'curiosity', label: 'Solo por curiosidad' },
      { value: 'not_sure', label: 'No estoy seguro/a' },
    ],
  },
];

type Draft = Partial<Omit<SessionEvaluationPayload, 'trustImprovement' | 'submittedAt'>>;
type ExtendedEvaluation = NonNullable<SessionEvaluationPayload['extended']>;

export function SessionEvaluationForm() {
  const { submitSessionEvaluation } = useTherapyFlow();
  const [draft, setDraft] = useState<Draft>({});
  const [trustImprovement, setTrustImprovement] = useState('');
  const [showExtended, setShowExtended] = useState(false);
  const [privacyFeltClear, setPrivacyFeltClear] =
    useState<ExtendedEvaluation['privacyFeltClear']>();
  const [voiceExperience, setVoiceExperience] = useState<ExtendedEvaluation['voiceExperience']>();
  const [wouldRecommend, setWouldRecommend] = useState<ExtendedEvaluation['wouldRecommend']>();
  const [distrustNote, setDistrustNote] = useState('');
  const [informationNeeded, setInformationNeeded] = useState('');
  const [validation, setValidation] = useState<string | null>(null);

  const answeredCount = QUESTIONS.filter((question) => Boolean(draft[question.key])).length;
  const complete = answeredCount === QUESTIONS.length;

  function setAnswer(key: Question['key'], value: AnswerValue) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setValidation(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!complete) {
      setValidation('Responde las preguntas rápidas para continuar.');
      return;
    }

    submitSessionEvaluation({
      comfort: draft.comfort as SessionEvaluationPayload['comfort'],
      feltHeard: draft.feltHeard as SessionEvaluationPayload['feltHeard'],
      responseQualityIssue:
        draft.responseQualityIssue as SessionEvaluationPayload['responseQualityIssue'],
      helpedOrganize: draft.helpedOrganize as SessionEvaluationPayload['helpedOrganize'],
      wouldUseInRealMoment:
        draft.wouldUseInRealMoment as SessionEvaluationPayload['wouldUseInRealMoment'],
      understandsProfessionalLimit:
        draft.understandsProfessionalLimit as SessionEvaluationPayload['understandsProfessionalLimit'],
      valueSignal: draft.valueSignal as SessionEvaluationPayload['valueSignal'],
      trustImprovement: trustImprovement.trim(),
      extended: showExtended
        ? {
            privacyFeltClear,
            voiceExperience,
            wouldRecommend,
            distrustNote: distrustNote.trim() || undefined,
            informationNeeded: informationNeeded.trim() || undefined,
          }
        : undefined,
      submittedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="card flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Chip className="self-start">Evaluación breve</Chip>
        <h1 className="font-display font-bold text-[clamp(24px,3.5vw,32px)] tracking-tight">
          Ayúdanos a mejorar Ataraxia
        </h1>
        <p className="leading-relaxed text-muted">
          Tus respuestas nos ayudan a entender si la experiencia se sintió útil,
          clara y segura. No necesitas escribir detalles personales.
        </p>
      </header>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div className="flex items-center gap-2 rounded-md2 border border-hairline bg-blue-bg px-4 py-3 text-sm text-blue-text">
          <IconShield className="h-4 w-4 shrink-0" />
          Esta evaluación se guarda junto a tu sesión para mejorar el MVP.
        </div>

        <div className="flex flex-col gap-4">
          {QUESTIONS.map((question) => (
            <fieldset key={question.key} className="m-0 border-0 p-0">
              <legend className="mb-2 text-sm font-semibold text-ink">{question.title}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {question.options.map((option) => {
                  const active = draft[question.key] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      className={`relative min-h-12 rounded-md2 border px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
                        active
                          ? 'border-primary bg-lavender text-primary-dark'
                          : 'border-hairline bg-white text-ink hover:border-primary hover:bg-lavender/40'
                      }`}
                      onClick={() => setAnswer(question.key, option.value)}
                    >
                      <span className="inline-flex items-center justify-center gap-1.5">
                        {active && <IconCheck className="h-3.5 w-3.5" />}
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="field">
          <label htmlFor="trustImprovement">
            ¿Qué tendría que mejorar para que confiaras más en Ataraxia?
          </label>
          <textarea
            id="trustImprovement"
            name="trustImprovement"
            value={trustImprovement}
            onChange={(event) => setTrustImprovement(event.target.value)}
            placeholder="Opcional"
            rows={3}
          />
        </div>

        <div className="rounded-md2 border border-hairline bg-white p-4">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 text-left font-display text-base font-bold text-ink"
            aria-expanded={showExtended}
            onClick={() => setShowExtended((current) => !current)}
          >
            Preguntas adicionales opcionales
            <span className="text-sm font-semibold text-primary-dark">
              {showExtended ? 'Ocultar' : 'Responder'}
            </span>
          </button>

          {showExtended && (
            <div className="mt-4 flex flex-col gap-4">
              <CompactChoice
                label="¿La interfaz te dio sensación de privacidad?"
                value={privacyFeltClear}
                options={[
                  { value: 'yes', label: 'Sí' },
                  { value: 'somewhat', label: 'Más o menos' },
                  { value: 'no', label: 'No' },
                ]}
                onChange={(value) => setPrivacyFeltClear(value as ExtendedEvaluation['privacyFeltClear'])}
              />

              <CompactChoice
                label="Si probaste la llamada, ¿cómo se sintió?"
                value={voiceExperience}
                options={[
                  { value: 'natural', label: 'Natural' },
                  { value: 'useful', label: 'Útil' },
                  { value: 'strange', label: 'Extraña' },
                  { value: 'not_used', label: 'No la usé' },
                ]}
                onChange={(value) => setVoiceExperience(value as ExtendedEvaluation['voiceExperience'])}
              />

              <CompactChoice
                label="¿Recomendarías Ataraxia a alguien cercano?"
                value={wouldRecommend}
                options={[
                  { value: 'yes', label: 'Sí' },
                  { value: 'somewhat', label: 'Tal vez' },
                  { value: 'no', label: 'No' },
                ]}
                onChange={(value) => setWouldRecommend(value as ExtendedEvaluation['wouldRecommend'])}
              />

              <div className="field">
                <label htmlFor="distrustNote">¿Hubo algo que te dio desconfianza?</label>
                <textarea
                  id="distrustNote"
                  name="distrustNote"
                  value={distrustNote}
                  onChange={(event) => setDistrustNote(event.target.value)}
                  placeholder="Opcional"
                  rows={2}
                />
              </div>

              <div className="field">
                <label htmlFor="informationNeeded">
                  ¿Qué información te gustaría saber antes de usarla con algo personal?
                </label>
                <textarea
                  id="informationNeeded"
                  name="informationNeeded"
                  value={informationNeeded}
                  onChange={(event) => setInformationNeeded(event.target.value)}
                  placeholder="Opcional"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {(validation || !complete) && (
          <p className={validation ? 'form-error' : 'text-sm text-muted'}>
            {validation ?? `${answeredCount} de ${QUESTIONS.length} respondidas`}
          </p>
        )}

        <Button type="submit" className="self-stretch sm:self-start">
          Continuar al registro
          <IconArrowRight className="h-4 w-4" />
        </Button>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
          <IconHeart className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Esta evaluación no sustituye atención profesional ni se usa para
          diagnosticarte.
        </p>
      </form>
    </div>
  );
}

interface CompactChoiceProps {
  label: string;
  value?: AnswerValue;
  options: Option[];
  onChange: (value: AnswerValue) => void;
}

function CompactChoice({ label, value, options, onChange }: CompactChoiceProps) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
                active
                  ? 'border-primary bg-lavender text-primary-dark'
                  : 'border-hairline bg-white text-ink hover:border-primary hover:bg-lavender/40'
              }`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
