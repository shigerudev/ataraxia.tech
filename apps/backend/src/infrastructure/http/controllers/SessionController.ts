import type { Response } from 'express';
import type { FlowServices } from '../../container.js';
import type { SupabaseAuthedRequest } from '../middleware/supabaseAuthMiddleware.js';
import {
  SessionNotFoundError,
  UnauthorizedSessionError,
  ValidationError,
} from '../../../domain/errors/FlowErrors.js';

export class SessionController {
  constructor(private readonly flow: FlowServices) {}

  createSession = async (req: SupabaseAuthedRequest, res: Response): Promise<void> => {
    try {
      const channel = (req.body?.channel ?? 'chat') as 'chat' | 'voice';
      const session = await this.flow.createSessionUseCase.execute({
        userId: req.userId!,
        channel,
      });
      res.status(201).json({ session });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  submitScreening = async (req: SupabaseAuthedRequest, res: Response): Promise<void> => {
    try {
      const { phq9, gad7 } = req.body ?? {};
      const result = await this.flow.submitScreeningUseCase.execute({
        sessionId: String(req.params.id),
        userId: req.userId!,
        phq9,
        gad7,
      });
      res.json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  sendMessage = async (req: SupabaseAuthedRequest, res: Response): Promise<void> => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const write = (event: string, data: unknown): void => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const content = req.body?.content as string;
      const generator = this.flow.sendMessageUseCase.execute({
        sessionId: String(req.params.id),
        userId: req.userId!,
        content,
      });

      for await (const evt of generator) {
        if (evt.type === 'token') write('token', { value: evt.value });
        else if (evt.type === 'crisis') write('crisis', evt.crisis);
        else if (evt.type === 'done') write('done', {});
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal error';
      write('error', { error: message });
    } finally {
      res.end();
    }
  };

  closeSession = async (req: SupabaseAuthedRequest, res: Response): Promise<void> => {
    try {
      const { aliasAnonimo, email, phone, modalidad, joinMode, scheduledAt, diagnostico } =
        req.body ?? {};
      const profile = await this.flow.closeSessionUseCase.execute({
        sessionId: String(req.params.id),
        userId: req.userId!,
        aliasAnonimo,
        email,
        phone,
        modalidad,
        joinMode,
        scheduledAt,
        diagnostico,
      });
      res.json({ profile });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: unknown): void {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof SessionNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof UnauthorizedSessionError) {
      res.status(403).json({ error: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : 'Internal error';
    res.status(500).json({ error: message });
  }
}
