import type { RiskLevel, Session, SessionChannel } from '../entities/Session.js';
import type { ConversationTurn } from '../entities/Conversation.js';
import type { JoinMode, Profile, TherapyModality } from '../entities/Profile.js';

export interface CreateSessionInput {
  userId: string;
  channel: SessionChannel;
}

export interface AddTurnInput {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  emotionTags?: string[];
  riskSignal?: RiskLevel | null;
}

export interface AddRiskEventInput {
  sessionId: string;
  level: 'medium' | 'high';
  source: 'message' | 'voice_transcript';
  detail?: string;
}

export interface UpsertProfileInput {
  userId: string;
  aliasAnonimo: string;
  email?: string | null;
  phone?: string | null;
  clinicalSummary?: Record<string, unknown> | null;
  modalidad?: TherapyModality | null;
  joinMode?: JoinMode | null;
  scheduledAt?: string | null;
}

export interface ISessionRepository {
  createSession(input: CreateSessionInput): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  updateSession(
    sessionId: string,
    patch: Partial<Pick<Session, 'status' | 'riskLevel' | 'closedAt'>>,
  ): Promise<void>;
  addTurn(input: AddTurnInput): Promise<ConversationTurn>;
  getTurns(sessionId: string): Promise<ConversationTurn[]>;
  addRiskEvent(input: AddRiskEventInput): Promise<void>;
  upsertProfile(input: UpsertProfileInput): Promise<Profile>;
}
