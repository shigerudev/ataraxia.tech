import type { RiskLevel } from '../../domain/entities/Session.js';
import type { IRiskClassifier, RiskAssessment } from '../../domain/services/IRiskClassifier.js';
import type { ILlmService } from '../../domain/services/ILlmService.js';

// Señales léxicas de alto riesgo (español). Compuerta determinística: cualquier
// coincidencia fuerza nivel "high" sin depender del LLM.
const HIGH_RISK_PATTERNS: RegExp[] = [
  /\bme quiero (morir|matar)\b/i,
  /\bquiero (morir|matarme|desaparecer)\b/i,
  /\bme voy a (matar|suicidar)\b/i,
  /\bpensando en (suicidarme|matarme)\b/i,
  /\bsuicid(a|ar|arme|io)\b/i,
  /\bno quiero (vivir|seguir viviendo)\b/i,
  /\bacabar con mi vida\b/i,
  /\bhacerme daño\b/i,
  /\bautolesion(a|arme|es)?\b/i,
  /\bcortarme\b/i,
  /\bmejor (muerto|muerta)\b/i,
  /\bkill myself\b/i,
  /\bwant to die\b/i,
  /\bsuicide\b/i,
];

const CLASSIFIER_PROMPT = `Eres un clasificador de riesgo en salud mental. Analiza el mensaje del usuario y responde SOLO con una palabra: "low", "medium" o "high".
- "high": ideación suicida, autolesión, plan o intención de hacerse daño a sí mismo o a otros.
- "medium": angustia intensa, desesperanza marcada, sin ideación explícita.
- "low": malestar leve o moderado sin señales de peligro.
Responde únicamente con la palabra.`;

export class RiskClassifier implements IRiskClassifier {
  constructor(private readonly llmService: ILlmService) {}

  async classifyMessage(text: string): Promise<RiskAssessment> {
    for (const pattern of HIGH_RISK_PATTERNS) {
      if (pattern.test(text)) {
        return { level: 'high', flags: { lexicalMatch: true }, reason: 'Lexical high-risk match' };
      }
    }

    // Clasificador LLM secundario (mejor recall en fraseos indirectos).
    try {
      const raw = await this.llmService.chat({
        temperature: 0,
        messages: [
          { role: 'system', content: CLASSIFIER_PROMPT },
          { role: 'user', content: text },
        ],
      });
      const level = this.parseLevel(raw);
      return { level, flags: { llmClassifier: true } };
    } catch {
      // Si el LLM no está disponible, fallar de forma segura pero no bloqueante.
      return { level: 'low', flags: { classifierUnavailable: true } };
    }
  }

  private parseLevel(raw: string): RiskLevel {
    const normalized = raw.trim().toLowerCase();
    if (normalized.includes('high')) return 'high';
    if (normalized.includes('medium')) return 'medium';
    return 'low';
  }
}
