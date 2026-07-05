import { env } from '../config/env.js';

export interface N8nWorkflowSummary {
  id: string;
  name: string;
  active: boolean;
}

interface N8nWorkflowRow {
  id: string;
  name: string;
  active: boolean;
}

interface N8nListWorkflowsResponse {
  data?: N8nWorkflowRow[];
}

export class N8nClient {
  isConfigured(): boolean {
    return Boolean(env.n8nBaseUrl && env.n8nApiKey);
  }

  async listWorkflows(): Promise<N8nWorkflowSummary[]> {
    const data = await this.request<N8nListWorkflowsResponse>('/workflows');
    return (data.data ?? []).map((workflow) => ({
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
    }));
  }

  private async request<T>(path: string): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('n8n no está configurado. Define N8N_BASE_URL y N8N_API_KEY.');
    }

    const response = await fetch(this.url(path), {
      headers: {
        Accept: 'application/json',
        'X-N8N-API-KEY': env.n8nApiKey,
      },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`n8n API failed (${response.status}): ${detail}`);
    }

    return response.json() as Promise<T>;
  }

  private url(path: string): string {
    const base = env.n8nBaseUrl.replace(/\/+$/, '');
    const apiRoot = base.endsWith('/api/v1') ? base : `${base}/api/v1`;
    return `${apiRoot}${path}`;
  }
}
