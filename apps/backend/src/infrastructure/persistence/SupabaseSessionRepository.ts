import type { SupabaseClient } from '@supabase/supabase-js';
import type { Session } from '../../domain/entities/Session.js';
import type { ConversationTurn } from '../../domain/entities/Conversation.js';
import type { Profile } from '../../domain/entities/Profile.js';
import type {
  AddRiskEventInput,
  AddTurnInput,
  CreateSessionInput,
  ISessionRepository,
  UpsertProfileInput,
} from '../../domain/repositories/ISessionRepository.js';

interface SessionRow {
  id: string;
  user_id: string;
  channel: 'chat' | 'voice';
  status: 'active' | 'crisis' | 'closed';
  risk_level: 'low' | 'medium' | 'high' | null;
  created_at: string;
  closed_at: string | null;
}

interface TurnRow {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion_tags: string[];
  risk_signal: 'low' | 'medium' | 'high' | null;
  created_at: string;
}

export class SupabaseSessionRepository implements ISessionRepository {
  constructor(private readonly client: SupabaseClient) {}

  async createSession(input: CreateSessionInput): Promise<Session> {
    const { data, error } = await this.client
      .from('sessions')
      .insert({ user_id: input.userId, channel: input.channel })
      .select()
      .single();
    if (error) throw new Error(`createSession failed: ${error.message}`);
    return this.toSession(data as SessionRow);
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const { data, error } = await this.client
      .from('sessions')
      .select()
      .eq('id', sessionId)
      .maybeSingle();
    if (error) throw new Error(`getSession failed: ${error.message}`);
    return data ? this.toSession(data as SessionRow) : null;
  }

  async updateSession(
    sessionId: string,
    patch: Partial<Pick<Session, 'status' | 'riskLevel' | 'closedAt'>>,
  ): Promise<void> {
    const row: Record<string, unknown> = {};
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.riskLevel !== undefined) row.risk_level = patch.riskLevel;
    if (patch.closedAt !== undefined) row.closed_at = patch.closedAt;
    if (Object.keys(row).length === 0) return;

    const { error } = await this.client.from('sessions').update(row).eq('id', sessionId);
    if (error) throw new Error(`updateSession failed: ${error.message}`);
  }

  async addTurn(input: AddTurnInput): Promise<ConversationTurn> {
    const { data, error } = await this.client
      .from('conversation_turns')
      .insert({
        session_id: input.sessionId,
        role: input.role,
        content: input.content,
        emotion_tags: input.emotionTags ?? [],
        risk_signal: input.riskSignal ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`addTurn failed: ${error.message}`);
    return this.toTurn(data as TurnRow);
  }

  async getTurns(sessionId: string): Promise<ConversationTurn[]> {
    const { data, error } = await this.client
      .from('conversation_turns')
      .select()
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(`getTurns failed: ${error.message}`);
    return (data as TurnRow[]).map((row) => this.toTurn(row));
  }

  async addRiskEvent(input: AddRiskEventInput): Promise<void> {
    const { error } = await this.client.from('risk_events').insert({
      session_id: input.sessionId,
      level: input.level,
      source: input.source,
      detail: input.detail ?? null,
    });
    if (error) throw new Error(`addRiskEvent failed: ${error.message}`);
  }

  async upsertProfile(input: UpsertProfileInput): Promise<Profile> {
    const { data, error } = await this.client
      .from('profiles')
      .upsert({
        id: input.userId,
        alias_anonimo: input.aliasAnonimo,
        email: input.email ?? null,
        phone: input.phone ?? null,
        clinical_summary: input.clinicalSummary ?? null,
        modalidad: input.modalidad ?? null,
        join_mode: input.joinMode ?? null,
        scheduled_at: input.scheduledAt ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`upsertProfile failed: ${error.message}`);
    return {
      id: data.id,
      aliasAnonimo: data.alias_anonimo,
      email: data.email,
      phone: data.phone,
      clinicalSummary: data.clinical_summary,
      modalidad: data.modalidad,
      joinMode: data.join_mode ?? null,
      scheduledAt: data.scheduled_at ?? null,
      createdAt: data.created_at,
    };
  }

  private toSession(row: SessionRow): Session {
    return {
      id: row.id,
      userId: row.user_id,
      channel: row.channel,
      status: row.status,
      riskLevel: row.risk_level,
      createdAt: row.created_at,
      closedAt: row.closed_at,
    };
  }

  private toTurn(row: TurnRow): ConversationTurn {
    return {
      id: row.id,
      sessionId: row.session_id,
      role: row.role,
      content: row.content,
      emotionTags: row.emotion_tags ?? [],
      riskSignal: row.risk_signal,
      createdAt: row.created_at,
    };
  }
}
