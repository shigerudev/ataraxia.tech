export interface CrisisHotline {
  name: string;
  phone: string;
}

export interface CrisisInfo {
  message: string;
  hotlines: CrisisHotline[];
}

export interface ICrisisProtocol {
  /** Devuelve el contenido de contención de crisis (líneas de ayuda + mensaje). */
  getCrisisInfo(): CrisisInfo;
}
