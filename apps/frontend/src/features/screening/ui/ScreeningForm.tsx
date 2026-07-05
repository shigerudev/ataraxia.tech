import { useMemo, useState } from 'react';
import {
  GAD7_QUESTIONS,
  PHQ9_QUESTIONS,
  SCREENING_OPTIONS,
  type ScreeningQuestion,
} from '@/entities/screening';
import { Button, Chip } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';

type Answers = Record<string, number>;

function QuestionBlock({
  question,
  value,
  onChange,
}: {
  question: ScreeningQuestion;
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset className="m-0 p-0 border-0">
      <legend className="text-[15px] font-medium text-ink mb-2.5">{question.text}</legend>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SCREENING_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`cursor-pointer text-center text-[13px] font-medium px-3 py-2.5 rounded-full border transition ${
                selected
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-muted border-hairline hover:border-navy'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ScreeningForm() {
  const { submitScreeningAnswers, loading, error } = useTherapyFlow();
  const [answers, setAnswers] = useState<Answers>({});
  const [showValidation, setShowValidation] = useState(false);

  const allQuestions = useMemo(() => [...PHQ9_QUESTIONS, ...GAD7_QUESTIONS], []);
  const complete = allQuestions.every((q) => answers[q.id] !== undefined);

  function setAnswer(id: string, value: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit() {
    if (!complete) {
      setShowValidation(true);
      return;
    }
    const phq9 = PHQ9_QUESTIONS.map((q) => answers[q.id]);
    const gad7 = GAD7_QUESTIONS.map((q) => answers[q.id]);
    await submitScreeningAnswers(phq9, gad7);
  }

  return (
    <div className="card flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <Chip className="self-start">Cuestionario inicial</Chip>
        <h1 className="font-display font-bold text-[clamp(24px,3.5vw,32px)] tracking-tight">
          Antes de comenzar
        </h1>
        <p className="text-muted leading-relaxed">
          Estas preguntas nos ayudan a conocer cómo te has sentido durante las
          últimas dos semanas. Responde con sinceridad; es un espacio seguro y anónimo.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2.5">
          <Chip variant="blue">PHQ-9</Chip> Estado de ánimo
        </h2>
        {PHQ9_QUESTIONS.map((q) => (
          <QuestionBlock
            key={q.id}
            question={q}
            value={answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2.5">
          <Chip variant="blue">GAD-7</Chip> Ansiedad
        </h2>
        {GAD7_QUESTIONS.map((q) => (
          <QuestionBlock
            key={q.id}
            question={q}
            value={answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}
      </section>

      {showValidation && !complete && (
        <p className="text-pink font-medium text-sm" role="alert">
          Por favor responde todas las preguntas para continuar.
        </p>
      )}
      {error && (
        <p className="text-pink font-medium text-sm" role="alert">
          {error}
        </p>
      )}

      <Button type="button" onClick={handleSubmit} loading={loading} className="self-start">
        Continuar
      </Button>
    </div>
  );
}
