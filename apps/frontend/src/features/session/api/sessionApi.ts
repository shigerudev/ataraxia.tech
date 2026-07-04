import { apiClient, apiUrl } from '@/shared/api';
import type {
  CrisisInfo,
  RiskLevel,
  Session,
  SessionChannel,
  TherapyModality,
} from '@/entities/session';

export async function createSession(
  token: string,
  channel: SessionChannel,
): Promise<{ session: Session }> {
  return apiClient(apiUrl('/api/sessions'), { method: 'POST', token, body: { channel } });
}

export interface ScreeningResponse {
  riskLevel: RiskLevel;
  crisis: boolean;
  crisisInfo?: CrisisInfo;
  scores: { phq9: number; gad7: number };
}

export async function submitScreening(
  token: string,
  sessionId: string,
  phq9: number[],
  gad7: number[],
): Promise<ScreeningResponse> {
  return apiClient(apiUrl(`/api/sessions/${sessionId}/screening`), {
    method: 'POST',
    token,
    body: { phq9, gad7 },
  });
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
