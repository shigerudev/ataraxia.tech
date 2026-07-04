import type { RiskLevel, Session, SessionChannel } from '../entities/Session.js';
import type { ScreeningResult } from '../entities/Screening.js';
import type { ConversationTurn } from '../entities/Conversation.js';
import type { Profile, TherapyModality } from '../entities/Profile.js';

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

export interface AddScreeningInput {
  sessionId: string;
  instrument: ScreeningResult['instrument'];
  answers: number[];
  score: number;
  riskLevel: RiskLevel;
  flags: Record<string, boolean>;
}

export interface AddRiskEventInput {
  sessionId: string;
  level: 'medium' | 'high';
  source: 'screening' | 'message';
  detail?: string;
}

export interface UpsertProfileInput {
  userId: string;
  aliasAnonimo: string;
  email?: string | null;
  phone?: string | null;
  diagnostico?: Record<string, unknown> | null;
  modalidad?: TherapyModality | null;
}

export interface ISessionRepository {
  createSession(input: CreateSessionInput): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  updateSession(
    sessionId: string,
    patch: Partial<Pick<Session, 'status' | 'riskLevel' | 'closedAt'>>,
  ): Promise<void>;
  addScreening(input: AddScreeningInput): Promise<ScreeningResult>;
  addTurn(input: AddTurnInput): Promise<ConversationTurn>;
  getTurns(sessionId: string): Promise<ConversationTurn[]>;
  addRiskEvent(input: AddRiskEventInput): Promise<void>;
  upsertProfile(input: UpsertProfileInput): Promise<Profile>;
}
