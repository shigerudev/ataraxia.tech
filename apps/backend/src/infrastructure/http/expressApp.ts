import express, { type Express } from 'express';
import cors from 'cors';
import { env } from '../config/env.js';
import type { AppContainer } from '../container.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { createSessionRoutes } from './routes/sessionRoutes.js';

export function createApp(container: AppContainer): Express {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'ataraxia-backend',
      flow: container.flow ? 'enabled' : 'disabled',
    });
  });

  app.use('/api/auth', createAuthRoutes(container));

  if (container.flow) {
    app.use('/api/sessions', createSessionRoutes(container.flow));
  }

  return app;
}
