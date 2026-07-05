import type { RiskLevel } from '../entities/Session.js';

export interface RiskAssessment {
  level: RiskLevel;
  reason?: string;
  flags?: Record<string, boolean>;
}

export interface IRiskClassifier {
  /** Clasifica el riesgo de un mensaje del usuario (determinístico + LLM). */
  classifyMessage(text: string): Promise<RiskAssessment>;
}
