export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const AUTH_TOKEN_KEY = 'ataraxia_auth_token';

export const ROUTES = {
  home: '/',
  staffLogin: '/staff/login',
  staffDashboard: '/staff',
} as const;
