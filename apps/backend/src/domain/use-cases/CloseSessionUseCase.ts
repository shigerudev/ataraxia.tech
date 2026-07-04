import type { Profile, TherapyModality } from '../entities/Profile.js';
import type { ISessionRepository } from '../repositories/ISessionRepository.js';
import { SessionNotFoundError, UnauthorizedSessionError, ValidationError } from '../errors/FlowErrors.js';

export interface CloseSessionInput {
  sessionId: string;
  userId: string;
  aliasAnonimo: string;
  email?: string | null;
  phone?: string | null;
  modalidad?: TherapyModality | null;
  diagnostico?: Record<string, unknown> | null;
}

export class CloseSessionUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(input: CloseSessionInput): Promise<Profile> {
    const alias = input.aliasAnonimo?.trim();
    if (!alias) throw new ValidationError('aliasAnonimo is required');

    const session = await this.sessionRepository.getSession(input.sessionId);
    if (!session) throw new SessionNotFoundError();
    if (session.userId !== input.userId) throw new UnauthorizedSessionError();

    const profile = await this.sessionRepository.upsertProfile({
      userId: input.userId,
      aliasAnonimo: alias,
      email: input.email ?? null,
      phone: input.phone ?? null,
      modalidad: input.modalidad ?? null,
      diagnostico: input.diagnostico ?? null,
    });

    await this.sessionRepository.updateSession(input.sessionId, {
      status: 'closed',
      closedAt: new Date().toISOString(),
    });

    return profile;
  }
}
