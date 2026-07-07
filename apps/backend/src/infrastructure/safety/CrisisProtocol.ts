import type { CrisisHotline, CrisisInfo, ICrisisProtocol } from '../../domain/services/ICrisisProtocol.js';

const CRISIS_MESSAGE =
  'Noto que estás pasando por un dolor muy profundo y quiero que estés a salvo. ' +
  'Antes de seguir, necesito preguntarte algo directo para cuidarte: ¿estás pensando en hacerte daño ahora mismo? ' +
  'Mi capacidad como asistente es limitada en este momento; por favor comunícate ahora con ayuda profesional o con una línea de crisis. ' +
  'Si puedes, llama o escribe también a alguien de confianza que pueda estar contigo ahora.';

export class CrisisProtocol implements ICrisisProtocol {
  private readonly hotlines: CrisisHotline[];

  constructor(hotlinesConfig: string) {
    this.hotlines = CrisisProtocol.parseHotlines(hotlinesConfig);
  }

  getCrisisInfo(): CrisisInfo {
    return { message: CRISIS_MESSAGE, hotlines: this.hotlines };
  }

  static parseHotlines(config: string): CrisisHotline[] {
    return config
      .split('|')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const idx = entry.lastIndexOf(':');
        if (idx === -1) return { name: entry, phone: '' };
        return { name: entry.slice(0, idx).trim(), phone: entry.slice(idx + 1).trim() };
      })
      .filter((h) => h.phone.length > 0);
  }
}
