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
        source: 'message',
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

  transcribeVoice = async (req: SupabaseAuthedRequest, res: Response): Promise<void> => {
    try {
      const transcript = String(req.body?.transcript ?? '').trim();
      if (!transcript) throw new ValidationError('transcript is required');
      res.json({ transcript });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  replyToVoice = async (req: SupabaseAuthedRequest, res: Response): Promise<void> => {
    try {
      const transcript = String(req.body?.transcript ?? '').trim();
      if (!transcript) throw new ValidationError('transcript is required');

      let text = '';
      let crisis = null;
      const generator = this.flow.sendMessageUseCase.execute({
        sessionId: String(req.params.id),
        userId: req.userId!,
        content: transcript,
        source: 'voice_transcript',
      });

      for await (const evt of generator) {
        if (evt.type === 'token') text += evt.value;
        else if (evt.type === 'crisis') {
          crisis = evt.crisis;
          text = evt.crisis.message;
        }
      }

      const audio = crisis ? null : await this.flow.voiceService.synthesize(text);
      res.json({
        transcript,
        text,
        crisis,
        audio,
        audioAvailable: Boolean(audio),
        voiceConfigured: this.flow.voiceService.isConfigured(),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  closeSession = async (req: SupabaseAuthedRequest, res: Response): Promise<void> => {
    try {
      const { aliasAnonimo, email, phone, modalidad, joinMode, scheduledAt, clinicalSummary } =
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
        clinicalSummary,
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
