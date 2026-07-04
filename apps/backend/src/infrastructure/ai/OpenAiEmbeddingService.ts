import OpenAI from 'openai';
import type { IEmbeddingService } from '../../domain/services/IEmbeddingService.js';
import { assertOpenAiConfigured, env } from '../config/env.js';

export class OpenAiEmbeddingService implements IEmbeddingService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    assertOpenAiConfigured();
    if (!this.client) {
      this.client = new OpenAI({ apiKey: env.openaiApiKey });
    }
    return this.client;
  }

  async embed(text: string): Promise<number[]> {
    const [vector] = await this.embedBatch([text]);
    return vector ?? [];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await this.getClient().embeddings.create({
      model: env.embeddingModel,
      input: texts,
    });
    return response.data.map((item) => item.embedding);
  }
}
