import type { RiskLevel } from './Session.js';

export type ScreeningInstrument = 'phq9' | 'gad7';

export interface ScreeningResult {
  id: string;
  sessionId: string;
  instrument: ScreeningInstrument;
  answers: number[];
  score: number;
  riskLevel: RiskLevel;
  flags: Record<string, boolean>;
  createdAt: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  flags: Record<string, boolean>;
  reason?: string;
}
