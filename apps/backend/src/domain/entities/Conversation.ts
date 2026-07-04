import type { RiskLevel } from './Session.js';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ConversationTurn {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  emotionTags: string[];
  riskSignal: RiskLevel | null;
  createdAt: string;
}

export interface KnowledgeChunk {
  id: number;
  documentId: number;
  content: string;
  similarity: number;
}
