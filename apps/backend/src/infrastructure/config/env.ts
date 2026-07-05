import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env'),
});

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  // Auth de staff (temporal, en memoria)
  jwtSecret: optional('JWT_SECRET', 'ataraxia-dev-secret-change-in-production'),
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
  staffPassword: optional('STAFF_DEFAULT_PASSWORD', 'Ataraxia2024!'),

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o',
  embeddingModel: process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small',

  // Recuperación (RAG)
  ragMatchCount: Number(process.env.RAG_MATCH_COUNT ?? 5),
  ragMatchThreshold: Number(process.env.RAG_MATCH_THRESHOLD ?? 0.5),

  // Líneas de ayuda de crisis (por país). Formato: "Nombre:Telefono|Nombre:Telefono"
  crisisHotlines: process.env.CRISIS_HOTLINES ??
    'Línea de crisis (Guatemala):1545|Emergencias:110',

  // Voz (ElevenLabs, server-side)
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY ?? '',
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID ?? '',
  elevenLabsModelId: process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2',
  elevenLabsOutputFormat: process.env.ELEVENLABS_OUTPUT_FORMAT ?? 'mp3_44100_128',
} as const;

export function assertSupabaseConfigured(): void {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error(
      'Supabase no está configurado. Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en apps/backend/.env',
    );
  }
}

export function assertOpenAiConfigured(): void {
  if (!env.openaiApiKey) {
    throw new Error('OpenAI no está configurado. Define OPENAI_API_KEY en apps/backend/.env');
  }
}
