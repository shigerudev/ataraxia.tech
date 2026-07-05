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

// Agente PÚBLICO de ElevenLabs que facilita la SALA GRUPAL en vivo. El
// anfitrión de la malla (menor peerId) lo conecta y puentea su audio a todos.
// Vacío = la sala grupal opera solo humano-a-humano.
export const ELEVENLABS_AGENT_ID_GROUP =
  import.meta.env.VITE_ELEVENLABS_AGENT_ID_GROUP ?? '';

// Servidor TURN opcional para redes restrictivas (NAT simétrico). Sin TURN,
// algunos pares simplemente no logran conectarse entre sí.
export const TURN_URL = import.meta.env.VITE_TURN_URL ?? '';
export const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME ?? '';
export const TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL ?? '';

export const AUTH_TOKEN_KEY = 'ataraxia_auth_token';

export const ROUTES = {
  home: '/',
  staffLogin: '/staff/login',
  staffDashboard: '/staff',
} as const;
