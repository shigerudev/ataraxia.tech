import { apiClient, apiUrl } from '@/shared/api';
import type { Session, SessionChannel, TherapyModality } from '@/entities/session';

export async function createSession(
  token: string,
  channel: SessionChannel,
): Promise<{ session: Session }> {
  return apiClient(apiUrl('/api/sessions'), { method: 'POST', token, body: { channel } });
}

export interface RegistrationPayload {
  aliasAnonimo: string;
  email?: string;
  phone?: string;
  modalidad?: TherapyModality;
}

export async function closeSession(
  token: string,
  sessionId: string,
  payload: RegistrationPayload,
): Promise<{ profile: unknown }> {
  return apiClient(apiUrl(`/api/sessions/${sessionId}/close`), {
    method: 'POST',
    token,
    body: payload,
  });
}
