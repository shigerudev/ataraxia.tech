import { Router } from 'express';
import type { FlowServices } from '../../container.js';
import { SessionController } from '../controllers/SessionController.js';
import { createSupabaseAuthMiddleware } from '../middleware/supabaseAuthMiddleware.js';

export function createSessionRoutes(flow: FlowServices): Router {
  const router = Router();
  const controller = new SessionController(flow);
  const auth = createSupabaseAuthMiddleware(flow.authGateway);

  router.use(auth);
  router.post('/', controller.createSession);
  router.post('/:id/screening', controller.submitScreening);
  router.post('/:id/messages', controller.sendMessage);
  router.post('/:id/close', controller.closeSession);

  return router;
}
