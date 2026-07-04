import { createApp } from './infrastructure/http/expressApp.js';
import { buildContainer } from './infrastructure/container.js';
import { disconnectMongo } from './infrastructure/persistence/mongo/mongoClient.js';
import { env } from './infrastructure/config/env.js';

async function bootstrap(): Promise<void> {
  const container = await buildContainer();
  const app = createApp(container);

  const server = app.listen(env.port, () => {
    console.log(`[ataraxia-backend] listening on http://localhost:${env.port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[ataraxia-backend] received ${signal}, shutting down…`);
    server.close();
    await disconnectMongo();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('[ataraxia-backend] failed to start', error);
  process.exit(1);
});
