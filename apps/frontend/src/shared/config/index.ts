export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const AUTH_TOKEN_KEY = 'ataraxia_auth_token';

export const ROUTES = {
  login: '/login',
  dashboard: '/',
} as const;
