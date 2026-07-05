export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Agente PÚBLICO de ElevenLabs para el modo de voz del chat. Vacío = modo
// demostración (el orbe reacciona al micrófono local, sin conversación real).
export const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID ?? '';

// Agente PÚBLICO de ElevenLabs para la SALA de acompañamiento individual (distinto
// del agente del chat). Vacío = cae al agente del chat o al modo demostración.
export const ELEVENLABS_AGENT_ID_INDIVIDUAL =
  import.meta.env.VITE_ELEVENLABS_AGENT_ID_INDIVIDUAL ?? '';

// Reservado (Fase 2): facilitador IA de la sala grupal. Aún no se usa; la sala
// grupal actual es audio humano-a-humano vía WebRTC.
export const ELEVENLABS_AGENT_ID_GROUP =
  import.meta.env.VITE_ELEVENLABS_AGENT_ID_GROUP ?? '';

export const AUTH_TOKEN_KEY = 'ataraxia_auth_token';

export const ROUTES = {
  home: '/',
  staffLogin: '/staff/login',
  staffDashboard: '/staff',
} as const;
