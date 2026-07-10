import type { ChatMessage } from '../entities/Conversation.js';
import type { ISessionRepository } from '../repositories/ISessionRepository.js';
import type { IKnowledgeRepository } from '../repositories/IKnowledgeRepository.js';
import type { ILlmService } from '../services/ILlmService.js';
import type { IEmbeddingService } from '../services/IEmbeddingService.js';
import type { IRiskClassifier } from '../services/IRiskClassifier.js';
import type { ICrisisProtocol, CrisisInfo } from '../services/ICrisisProtocol.js';
import { SessionNotFoundError, UnauthorizedSessionError, ValidationError } from '../errors/FlowErrors.js';

export interface SendMessageInput {
  sessionId: string;
  userId: string;
  content: string;
  source?: 'message' | 'voice_transcript';
}

export type SendMessageEvent =
  | { type: 'token'; value: string }
  | { type: 'crisis'; crisis: CrisisInfo }
  | { type: 'done' };

export interface SendMessageDeps {
  sessionRepository: ISessionRepository;
  knowledgeRepository: IKnowledgeRepository;
  llmService: ILlmService;
  embeddingService: IEmbeddingService;
  riskClassifier: IRiskClassifier;
  crisisProtocol: ICrisisProtocol;
  cbtSystemPrompt: string;
  ragMatchCount: number;
  ragMatchThreshold: number;
}

export class SendMessageUseCase {
  constructor(private readonly deps: SendMessageDeps) {}

  async *execute(input: SendMessageInput): AsyncGenerator<SendMessageEvent> {
    const content = input.content?.trim();
    if (!content) throw new ValidationError('content is required');
    const source = input.source ?? 'message';

    const session = await this.deps.sessionRepository.getSession(input.sessionId);
    if (!session) throw new SessionNotFoundError();
    if (session.userId !== input.userId) throw new UnauthorizedSessionError();

    // 1) Chequeo de riesgo ANTES de generar respuesta (compuerta de seguridad)
    const assessment = await this.deps.riskClassifier.classifyMessage(content);

    await this.deps.sessionRepository.addTurn({
      sessionId: input.sessionId,
      role: 'user',
      content,
      riskSignal: assessment.level,
      source,
    });

    if (assessment.level === 'high') {
      const crisis = this.deps.crisisProtocol.getCrisisInfo();
      await this.deps.sessionRepository.addRiskEvent({
        sessionId: input.sessionId,
        level: 'high',
        source,
        detail: assessment.reason ?? 'High-risk signal detected in message',
      });
      await this.deps.sessionRepository.updateSession(input.sessionId, {
        status: 'crisis',
        riskLevel: 'high',
      });
      await this.deps.sessionRepository.addTurn({
        sessionId: input.sessionId,
        role: 'assistant',
        content: crisis.message,
      });
      yield { type: 'crisis', crisis };
      return;
    }

    // 2) Recuperación (RAG) sobre la base de conocimiento psicológico
    let context = '';
    try {
      const embedding = await this.deps.embeddingService.embed(content);
      const chunks = await this.deps.knowledgeRepository.search(
        embedding,
        this.deps.ragMatchCount,
        this.deps.ragMatchThreshold,
      );
      context = chunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n');
    } catch {
      context = '';
    }

    // 3) Construcción de mensajes y streaming de la respuesta CBT
    const history = await this.deps.sessionRepository.getTurns(input.sessionId);
    const messages: ChatMessage[] = [
      { role: 'system', content: this.deps.cbtSystemPrompt },
    ];
    if (context) {
      messages.push({
        role: 'system',
        content:
          'Contexto clínico recuperado del corpus DSM-5/material autorizado ' +
          `(úsalo solo para guiar la indagación, no para diagnosticar ni citar textualmente):\n${context}`,
      });
    }
    for (const turn of history) {
      messages.push({ role: turn.role, content: turn.content });
    }

    let full = '';
    for await (const token of this.deps.llmService.chatStream({ messages, temperature: 0.6 })) {
      full += token;
      yield { type: 'token', value: token };
    }

    const safetyFollowUp = this.buildSafetyFollowUp(assessment.level, full);
    if (safetyFollowUp) {
      full += safetyFollowUp;
      yield { type: 'token', value: safetyFollowUp };
    }

    await this.deps.sessionRepository.addTurn({
      sessionId: input.sessionId,
      role: 'assistant',
      content: full,
    });

    yield { type: 'done' };
  }

  private buildSafetyFollowUp(level: 'low' | 'medium' | 'high', assistantText: string): string {
    if (level !== 'medium') return '';

    const normalized = assistantText.toLowerCase();
    const alreadyAskedSafety =
      normalized.includes('hacerte daño') ||
      normalized.includes('hacerte dano') ||
      normalized.includes('estás en peligro') ||
      normalized.includes('estas en peligro');

    if (alreadyAskedSafety) return '';

    return (
      '\n\nAntes de seguir, necesito preguntarte algo para cuidarte: ' +
      '¿estás en peligro de hacerte daño ahora mismo?'
    );
  }
}
