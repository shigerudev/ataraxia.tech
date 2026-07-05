import { env } from '../config/env.js';

export interface VoiceReplyAudio {
  audioBase64: string;
  mimeType: 'audio/mpeg';
}

export class ElevenLabsVoiceService {
  isConfigured(): boolean {
    return Boolean(env.elevenLabsApiKey && env.elevenLabsVoiceId);
  }

  async synthesize(text: string): Promise<VoiceReplyAudio | null> {
    const content = text.trim();
    if (!this.isConfigured() || !content) return null;

    const url = new URL(
      `https://api.elevenlabs.io/v1/text-to-speech/${env.elevenLabsVoiceId}`,
    );
    url.searchParams.set('output_format', env.elevenLabsOutputFormat);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
          'xi-api-key': env.elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: content,
          model_id: env.elevenLabsModelId,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        console.warn(
          `[ataraxia-backend] ElevenLabs TTS failed (${response.status}): ${detail}`,
        );
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return {
        audioBase64: Buffer.from(arrayBuffer).toString('base64'),
        mimeType: 'audio/mpeg',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      console.warn(`[ataraxia-backend] ElevenLabs TTS request failed: ${message}`);
      return null;
    }
  }
}
