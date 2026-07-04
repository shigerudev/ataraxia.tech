import type { RiskLevel } from '../entities/Session.js';
import type { ISessionRepository } from '../repositories/ISessionRepository.js';
import type { ICrisisProtocol, CrisisInfo } from '../services/ICrisisProtocol.js';
import { scoreScreening } from '../screening/screeningScoring.js';
import { SessionNotFoundError, UnauthorizedSessionError } from '../errors/FlowErrors.js';

export interface SubmitScreeningInput {
  sessionId: string;
  userId: string;
  phq9: number[];
  gad7: number[];
}

export interface SubmitScreeningResult {
  riskLevel: RiskLevel;
  crisis: boolean;
  crisisInfo?: CrisisInfo;
  scores: { phq9: number; gad7: number };
}

export class SubmitScreeningUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly crisisProtocol: ICrisisProtocol,
  ) {}

  async execute(input: SubmitScreeningInput): Promise<SubmitScreeningResult> {
    const session = await this.sessionRepository.getSession(input.sessionId);
    if (!session) throw new SessionNotFoundError();
    if (session.userId !== input.userId) throw new UnauthorizedSessionError();

    const result = scoreScreening(input.phq9, input.gad7);

    await this.sessionRepository.addScreening({
      sessionId: input.sessionId,
      instrument: 'phq9',
      answers: input.phq9,
      score: result.phq9.score,
      riskLevel: result.phq9.riskLevel,
      flags: result.phq9.flags,
    });
    await this.sessionRepository.addScreening({
      sessionId: input.sessionId,
      instrument: 'gad7',
      answers: input.gad7,
      score: result.gad7.score,
      riskLevel: result.gad7.riskLevel,
      flags: result.gad7.flags,
    });

    await this.sessionRepository.updateSession(input.sessionId, {
      riskLevel: result.overallRisk,
      status: result.crisis ? 'crisis' : session.status,
    });

    if (result.crisis) {
      await this.sessionRepository.addRiskEvent({
        sessionId: input.sessionId,
        level: 'high',
        source: 'screening',
        detail: result.flags.suicidalIdeation
          ? 'PHQ-9 item 9 positive (suicidal ideation)'
          : 'High combined screening score',
      });

      return {
        riskLevel: result.overallRisk,
        crisis: true,
        crisisInfo: this.crisisProtocol.getCrisisInfo(),
        scores: { phq9: result.phq9.score, gad7: result.gad7.score },
      };
    }

    return {
      riskLevel: result.overallRisk,
      crisis: false,
      scores: { phq9: result.phq9.score, gad7: result.gad7.score },
    };
  }
}
