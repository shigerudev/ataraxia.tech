import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { UnauthorizedError } from '../../../domain/errors/AuthErrors.js';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository.js';
import type { JwtService } from '../../auth/JwtService.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function createAuthMiddleware(
  jwtService: JwtService,
  authRepository: IAuthRepository,
): RequestHandler {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const header = req.headers.authorization;

      if (!header?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
      }

      const token = header.slice(7);
      const payload = jwtService.verify(token);
      const user = await authRepository.findByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      req.user = { id: user.id, email: user.email, role: user.role };
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
