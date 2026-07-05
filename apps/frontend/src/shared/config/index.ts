export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Agente PÚBLICO de ElevenLabs para el modo de voz del chat. Vacío = modo
// demostración (el orbe reacciona al micrófono local, sin conversación real).
export const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID ?? '';

export const AUTH_TOKEN_KEY = 'ataraxia_auth_token';

export const ROUTES = {
  home: '/',
  staffLogin: '/staff/login',
  staffDashboard: '/staff',
} as const;
