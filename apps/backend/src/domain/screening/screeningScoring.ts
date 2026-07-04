import type { RiskLevel } from '../entities/Session.js';

// PHQ-9: 9 ítems (0-3). El ítem 9 (índice 8) evalúa ideación suicida.
// GAD-7: 7 ítems (0-3).

export interface InstrumentScore {
  score: number;
  riskLevel: RiskLevel;
  flags: Record<string, boolean>;
}

export interface CombinedScreening {
  phq9: InstrumentScore;
  gad7: InstrumentScore;
  overallRisk: RiskLevel;
  crisis: boolean;
  flags: Record<string, boolean>;
}

const PHQ9_ITEMS = 9;
const GAD7_ITEMS = 7;
const PHQ9_SUICIDE_ITEM_INDEX = 8;

function sum(answers: number[]): number {
  return answers.reduce((acc, value) => acc + value, 0);
}

function assertValid(answers: number[], expectedLength: number, label: string): void {
  if (!Array.isArray(answers) || answers.length !== expectedLength) {
    throw new Error(`${label} debe tener exactamente ${expectedLength} respuestas`);
  }
  for (const value of answers) {
    if (!Number.isInteger(value) || value < 0 || value > 3) {
      throw new Error(`${label}: cada respuesta debe ser un entero entre 0 y 3`);
    }
  }
}

export function scorePhq9(answers: number[]): InstrumentScore {
  assertValid(answers, PHQ9_ITEMS, 'PHQ-9');
  const score = sum(answers);
  const suicideItem = answers[PHQ9_SUICIDE_ITEM_INDEX] ?? 0;
  const suicidalIdeation = suicideItem >= 1;

  let riskLevel: RiskLevel = 'low';
  if (suicidalIdeation || score >= 20) {
    riskLevel = 'high';
  } else if (score >= 10) {
    riskLevel = 'medium';
  }

  return { score, riskLevel, flags: { suicidalIdeation } };
}

export function scoreGad7(answers: number[]): InstrumentScore {
  assertValid(answers, GAD7_ITEMS, 'GAD-7');
  const score = sum(answers);

  let riskLevel: RiskLevel = 'low';
  if (score >= 15) {
    riskLevel = 'high';
  } else if (score >= 10) {
    riskLevel = 'medium';
  }

  return { score, riskLevel, flags: {} };
}

const RISK_ORDER: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };

function maxRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_ORDER[a] >= RISK_ORDER[b] ? a : b;
}

export function scoreScreening(phq9Answers: number[], gad7Answers: number[]): CombinedScreening {
  const phq9 = scorePhq9(phq9Answers);
  const gad7 = scoreGad7(gad7Answers);

  const overallRisk = maxRisk(phq9.riskLevel, gad7.riskLevel);
  const crisis = Boolean(phq9.flags.suicidalIdeation) || overallRisk === 'high';

  return {
    phq9,
    gad7,
    overallRisk,
    crisis,
    flags: { suicidalIdeation: Boolean(phq9.flags.suicidalIdeation) },
  };
}
