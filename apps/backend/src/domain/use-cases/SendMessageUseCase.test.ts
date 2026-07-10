import assert from 'node:assert/strict';
import test from 'node:test';
import type { ConversationTurn, KnowledgeChunk } from '../entities/Conversation.js';
import type { Profile } from '../entities/Profile.js';
import type { Session } from '../entities/Session.js';
import type {
  AddRiskEventInput,
  AddTurnInput,
  CreateSessionInput,
  ISessionRepository,
  UpsertProfileInput,
} from '../repositories/ISessionRepository.js';
import type { IKnowledgeRepository } from '../repositories/IKnowledgeRepository.js';
import type { IEmbeddingService } from '../services/IEmbeddingService.js';
import type { ILlmService } from '../services/ILlmService.js';
import type { ICrisisProtocol } from '../services/ICrisisProtocol.js';
import { RiskClassifier } from '../../infrastructure/safety/RiskClassifier.js';
import { SendMessageUseCase } from './SendMessageUseCase.js';

test('high-risk voice transcript persists crisis and skips regular assistant generation', async () => {
  const sessionRepository = new InMemorySessionRepository();
  const llmService = new ThrowingLlmService();
  const useCase = new SendMessageUseCase({
    sessionRepository,
    knowledgeRepository: new EmptyKnowledgeRepository(),
    llmService,
    embeddingService: new EmptyEmbeddingService(),
    riskClassifier: new RiskClassifier(llmService),
    crisisProtocol: new StaticCrisisProtocol(),
    cbtSystemPrompt: 'system',
    ragMatchCount: 0,
    ragMatchThreshold: 0,
  });

  const events = [];
  for await (const event of useCase.execute({
    sessionId: 'session-1',
    userId: 'user-1',
    content: 'Siento que la vida ya no vale la pena.',
    source: 'voice_transcript',
  })) {
    events.push(event);
  }

  assert.equal(events.length, 1);
  assert.equal(events[0]?.type, 'crisis');
  if (events[0]?.type === 'crisis') {
    assert.match(events[0].crisis.message, /hacerte daño ahora mismo/);
    assert.match(events[0].crisis.message, /ayuda profesional/);
    assert.match(events[0].crisis.message, /alguien de confianza/);
  }
  assert.equal(sessionRepository.turns.length, 2);
  assert.equal(sessionRepository.turns[0]?.role, 'user');
  assert.equal(sessionRepository.turns[0]?.riskSignal, 'high');
  assert.equal(sessionRepository.turns[0]?.source, 'voice_transcript');
  assert.equal(sessionRepository.turns[1]?.role, 'assistant');
  assert.equal(sessionRepository.turns[1]?.source, 'message');
  assert.match(sessionRepository.turns[1]?.content ?? '', /hacerte daño ahora mismo/);
  assert.equal(sessionRepository.riskEvents[0]?.source, 'voice_transcript');
  assert.equal(sessionRepository.riskEvents[0]?.level, 'high');
  assert.equal(sessionRepository.session.status, 'crisis');
  assert.equal(sessionRepository.session.riskLevel, 'high');
  assert.equal(llmService.streamCalled, false);
});

class InMemorySessionRepository implements ISessionRepository {
  session: Session = {
    id: 'session-1',
    userId: 'user-1',
    channel: 'chat',
    status: 'active',
    riskLevel: null,
    createdAt: new Date(0).toISOString(),
    closedAt: null,
  };
  turns: ConversationTurn[] = [];
  riskEvents: AddRiskEventInput[] = [];

  async createSession(input: CreateSessionInput): Promise<Session> {
    this.session = { ...this.session, userId: input.userId, channel: input.channel };
    return this.session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return sessionId === this.session.id ? this.session : null;
  }

  async updateSession(
    _sessionId: string,
    patch: Partial<Pick<Session, 'status' | 'riskLevel' | 'closedAt'>>,
  ): Promise<void> {
    this.session = { ...this.session, ...patch };
  }

  async addTurn(input: AddTurnInput): Promise<ConversationTurn> {
    const turn: ConversationTurn = {
      id: `turn-${this.turns.length + 1}`,
      sessionId: input.sessionId,
      role: input.role,
      content: input.content,
      emotionTags: input.emotionTags ?? [],
      riskSignal: input.riskSignal ?? null,
      source: input.source ?? 'message',
      createdAt: new Date(this.turns.length + 1).toISOString(),
    };
    this.turns.push(turn);
    return turn;
  }

  async getTurns(): Promise<ConversationTurn[]> {
    return this.turns;
  }

  async addRiskEvent(input: AddRiskEventInput): Promise<void> {
    this.riskEvents.push(input);
  }

  async upsertProfile(input: UpsertProfileInput): Promise<Profile> {
    return {
      id: input.userId,
      aliasAnonimo: input.aliasAnonimo,
      email: input.email ?? null,
      phone: input.phone ?? null,
      clinicalSummary: input.clinicalSummary ?? null,
      modalidad: input.modalidad ?? null,
      joinMode: input.joinMode ?? null,
      scheduledAt: input.scheduledAt ?? null,
      createdAt: new Date(0).toISOString(),
    };
  }
}

class ThrowingLlmService implements ILlmService {
  streamCalled = false;

  async chat(): Promise<string> {
    return 'low';
  }

  async *chatStream(): AsyncIterable<string> {
    this.streamCalled = true;
    throw new Error('regular generation should not run');
  }
}

class EmptyKnowledgeRepository implements IKnowledgeRepository {
  async search(): Promise<KnowledgeChunk[]> {
    return [];
  }
}

class EmptyEmbeddingService implements IEmbeddingService {
  async embed(): Promise<number[]> {
    return [];
  }

  async embedBatch(): Promise<number[][]> {
    return [];
  }
}

class StaticCrisisProtocol implements ICrisisProtocol {
  getCrisisInfo() {
    return {
      message:
        'Antes de seguir, necesito preguntarte algo directo: ¿estás pensando en hacerte daño ahora mismo? ' +
        'Por favor comunícate con ayuda profesional y llama a alguien de confianza.',
      hotlines: [{ name: 'Emergencias', phone: '110' }],
    };
  }
}
