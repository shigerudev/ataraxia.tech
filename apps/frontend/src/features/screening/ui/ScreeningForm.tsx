import { useMemo, useState } from 'react';
import {
  GAD7_QUESTIONS,
  PHQ9_QUESTIONS,
  SCREENING_OPTIONS,
  type ScreeningQuestion,
} from '@/entities/screening';
import { Button } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';
import './ScreeningForm.css';

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
    <fieldset className="screening-question">
      <legend>{question.text}</legend>
      <div className="screening-options">
        {SCREENING_OPTIONS.map((opt) => (
          <label key={opt.value} className={`screening-option ${value === opt.value ? 'is-selected' : ''}`}>
            <input
              type="radio"
              name={question.id}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
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
    <div className="screening">
      <header className="screening__header">
        <h1>Antes de comenzar</h1>
        <p>
          Estas preguntas nos ayudan a conocer cómo te has sentido durante las
          últimas dos semanas. Responde con sinceridad; es un espacio seguro y anónimo.
        </p>
      </header>

      <section className="screening__group">
        <h2>Estado de ánimo (PHQ-9)</h2>
        {PHQ9_QUESTIONS.map((q) => (
          <QuestionBlock key={q.id} question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
        ))}
      </section>

      <section className="screening__group">
        <h2>Ansiedad (GAD-7)</h2>
        {GAD7_QUESTIONS.map((q) => (
          <QuestionBlock key={q.id} question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
        ))}
      </section>

      {showValidation && !complete && (
        <p className="screening__error" role="alert">
          Por favor responde todas las preguntas para continuar.
        </p>
      )}
      {error && (
        <p className="screening__error" role="alert">
          {error}
        </p>
      )}

      <Button type="button" onClick={handleSubmit} loading={loading} className="screening__submit">
        Continuar
      </Button>
    </div>
  );
}
