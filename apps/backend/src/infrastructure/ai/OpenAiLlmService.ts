import OpenAI from 'openai';
import type { ILlmService, LlmChatParams } from '../../domain/services/ILlmService.js';
import { assertOpenAiConfigured, env } from '../config/env.js';

export class OpenAiLlmService implements ILlmService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    assertOpenAiConfigured();
    if (!this.client) {
      this.client = new OpenAI({ apiKey: env.openaiApiKey });
    }
    return this.client;
  }

  async chat(params: LlmChatParams): Promise<string> {
    const response = await this.getClient().chat.completions.create({
      model: env.openaiModel,
      temperature: params.temperature ?? 0.3,
      messages: params.messages,
    });
    return response.choices[0]?.message?.content ?? '';
  }

  async *chatStream(params: LlmChatParams): AsyncIterable<string> {
    const stream = await this.getClient().chat.completions.create({
      model: env.openaiModel,
      temperature: params.temperature ?? 0.6,
      messages: params.messages,
      stream: true,
    });
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) yield token;
    }
  }
}
