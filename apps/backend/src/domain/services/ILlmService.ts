import type { ChatMessage } from '../entities/Conversation.js';

export interface LlmChatParams {
  messages: ChatMessage[];
  temperature?: number;
}

export interface ILlmService {
  /** Respuesta completa (usada por clasificadores y tareas no interactivas). */
  chat(params: LlmChatParams): Promise<string>;
  /** Respuesta en streaming token a token (usada en la conversación terapéutica). */
  chatStream(params: LlmChatParams): AsyncIterable<string>;
}
