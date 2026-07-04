import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { IAuthGateway } from '../../../domain/repositories/IAuthGateway.js';

export interface SupabaseAuthedRequest extends Request {
  userId?: string;
}

/**
 * Verifica el access token de Supabase (usuario anónimo o registrado) enviado por
 * el frontend en el header Authorization: Bearer <token>.
 */
export function createSupabaseAuthMiddleware(authGateway: IAuthGateway): RequestHandler {
  return async (req: SupabaseAuthedRequest, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing Supabase access token' });
      return;
    }

    const token = header.slice(7);
    const user = await authGateway.verifyAccessToken(token);
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userId = user.id;
    next();
  };
}
