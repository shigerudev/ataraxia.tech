export type VoiceMode = 'agent' | 'demo';

export type VoiceStatus =
  | 'idle' // overlay abierto, aún sin iniciar
  | 'requesting-mic' // esperando el permiso de micrófono
  | 'connecting' // (agent) estableciendo la conversación
  | 'active' // escuchando / conversando
  | 'ended' // el usuario o el agente finalizó
  | 'error';

/**
 * Contrato único del modo de voz. Lo cumplen dos implementaciones:
 * - useAgentVoice: conversación real vía ElevenLabs Agents.
 * - useDemoVoice: modo demostración con el micrófono local (sin conversación).
 */
export interface VoiceSession {
  mode: VoiceMode;
  status: VoiceStatus;
  /** El agente está hablando (demo: siempre false). */
  isSpeaking: boolean;
  isMuted: boolean;
  /** Mensaje listo para mostrar al usuario. */
  error: string | null;
  start: () => Promise<void>;
  /** Idempotente; libera micrófono, AudioContext, rAF y la sesión del SDK. */
  stop: () => Promise<void>;
  toggleMute: () => void;
  /** Nivel 0..1 para animar el orbe. Se lee por requestAnimationFrame; nunca
      debe convertirse en estado de React por cuadro. */
  getLevel: () => number;
}

/** Transcripciones del modo de voz hacia el hilo del chat. */
export type VoiceTranscriptHandler = (role: 'user' | 'assistant', content: string) => void;
