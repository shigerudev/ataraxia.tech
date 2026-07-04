import express, { type Express } from 'express';
import cors from 'cors';
import { env } from '../config/env.js';
import type { AppContainer } from '../container.js';
import { createAuthRoutes } from './routes/authRoutes.js';

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
    res.json({ status: 'ok', service: 'ataraxia-backend' });
  });

  app.use('/api/auth', createAuthRoutes(container));

  return app;
}
