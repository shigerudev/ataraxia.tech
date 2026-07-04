import type { Session, SessionChannel } from '../entities/Session.js';
import type { ISessionRepository } from '../repositories/ISessionRepository.js';
import { ValidationError } from '../errors/FlowErrors.js';

export interface CreateSessionInput {
  userId: string;
  channel: SessionChannel;
}

export class CreateAnonymousSessionUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(input: CreateSessionInput): Promise<Session> {
    if (input.channel !== 'chat' && input.channel !== 'voice') {
      throw new ValidationError('channel must be "chat" or "voice"');
    }
    return this.sessionRepository.createSession({
      userId: input.userId,
      channel: input.channel,
    });
  }
}
