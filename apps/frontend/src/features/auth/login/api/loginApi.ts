import { apiClient, apiUrl } from '@/shared/api';
import type { User } from '@/entities/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export async function loginRequest(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>(apiUrl('/api/auth/login'), {
    method: 'POST',
    body: credentials,
  });
}

export async function meRequest(token: string): Promise<MeResponse> {
  return apiClient<MeResponse>(apiUrl('/api/auth/me'), {
    method: 'GET',
    token,
  });
}
