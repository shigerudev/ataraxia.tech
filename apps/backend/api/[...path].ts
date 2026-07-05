import { createApp } from '../src/infrastructure/http/expressApp.js';
import { buildContainer } from '../src/infrastructure/container.js';

let appPromise: ReturnType<typeof createServerlessApp> | null = null;

async function createServerlessApp() {
  const container = await buildContainer();
  return createApp(container);
}

export default async function handler(req: any, res: any) {
  appPromise ??= createServerlessApp();
  const app = await appPromise;
  return app(req, res);
}
