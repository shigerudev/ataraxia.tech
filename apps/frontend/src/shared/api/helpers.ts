import { API_BASE_URL } from '../config';

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
