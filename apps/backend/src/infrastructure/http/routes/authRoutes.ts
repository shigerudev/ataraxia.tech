import { Router } from 'express';
import type { AppContainer } from '../../container.js';
import { AuthController } from '../controllers/AuthController.js';
import { createAuthMiddleware } from '../middleware/authMiddleware.js';

export function createAuthRoutes(container: AppContainer): Router {
  const router = Router();
  const authController = new AuthController(
    container.loginUseCase,
    container.jwtService,
    container.staffAuthRepository,
  );
  const authMiddleware = createAuthMiddleware(container.jwtService, container.staffAuthRepository);

  router.post('/login', authController.login);
  router.get('/me', authMiddleware, authController.me);

  return router;
}
