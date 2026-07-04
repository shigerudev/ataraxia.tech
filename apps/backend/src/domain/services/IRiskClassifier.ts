import type { RiskAssessment } from '../entities/Screening.js';

export interface IRiskClassifier {
  /** Clasifica el riesgo de un mensaje del usuario (determinístico + LLM). */
  classifyMessage(text: string): Promise<RiskAssessment>;
}
