import type { RiskLevel } from '../../domain/entities/Session.js';
import type { IRiskClassifier, RiskAssessment } from '../../domain/services/IRiskClassifier.js';
import type { ILlmService } from '../../domain/services/ILlmService.js';

// Señales léxicas de alto riesgo (español). Compuerta determinística: cualquier
// coincidencia fuerza nivel "high" sin depender del LLM.
const HIGH_RISK_PATTERNS: RegExp[] = [
  /\bme quiero (morir|matar)\b/,
  /\bquiero (morir|matarme|desaparecer)\b/,
  /\bme voy a (matar|suicidar)\b/,
  /\bpensando en (suicidarme|matarme)\b/,
  /\bsuicid(a|ar|arme|io)\b/,
  /\bno quiero (vivir|seguir viviendo)\b/,
  /\bacabar con mi vida\b/,
  /\bhacerme dano\b/,
  /\bautolesion(a|arme|es)?\b/,
  /\bcortarme\b/,
  /\bmejor (muerto|muerta)\b/,
  /\bla vida (ya )?no vale la pena\b/,
  /\bno vale la pena vivir\b/,
  /\b(ya )?no tiene sentido (vivir|seguir viviendo)\b/,
  /\b(la )?vida (ya )?no tiene sentido\b/,
  /\bvivir no tiene sentido\b/,
  /\bno soporto vivir\b/,
  /\bno quiero despertar\b/,
  /\bquisiera no despertar\b/,
  /\bojala no despertar\b/,
  /\bkill myself\b/,
  /\bwant to die\b/,
  /\bsuicide\b/,
];

const CLASSIFIER_PROMPT = `Eres un clasificador de riesgo en salud mental. Analiza el mensaje del usuario y responde SOLO con una palabra: "low", "medium" o "high".
- "high": ideación suicida, autolesión, plan o intención de hacerse daño a sí mismo o a otros.
- "medium": angustia intensa, desesperanza marcada, sin ideación explícita.
- "low": malestar leve o moderado sin señales de peligro.
Responde únicamente con la palabra.`;

export class RiskClassifier implements IRiskClassifier {
  constructor(private readonly llmService: ILlmService) {}

  async classifyMessage(text: string): Promise<RiskAssessment> {
    const normalizedText = RiskClassifier.normalizeText(text);
    for (const pattern of HIGH_RISK_PATTERNS) {
      if (pattern.test(normalizedText)) {
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

  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
