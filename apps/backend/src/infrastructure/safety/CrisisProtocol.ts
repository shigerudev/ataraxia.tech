import type { CrisisHotline, CrisisInfo, ICrisisProtocol } from '../../domain/services/ICrisisProtocol.js';

const CRISIS_MESSAGE =
  'Noto que estás pasando por un dolor muy profundo y lo más importante ahora es que estés a salvo. ' +
  'Mi capacidad como asistente es limitada en este momento y no puedo acompañarte en esto solo. ' +
  'Por favor comunícate ahora mismo con ayuda profesional o con una línea de crisis. No estás solo/a.';

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
