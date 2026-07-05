import { apiClient, apiUrl } from '@/shared/api';
import type { JoinMode, Session, SessionChannel, TherapyModality } from '@/entities/session';

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
  /** Modo de entrada elegido en el paso de agenda. */
  joinMode?: JoinMode;
  /** ISO 8601. Solo cuando joinMode === 'scheduled'. */
  scheduledAt?: string;
  clinicalSummary?: Record<string, unknown>;
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

export async function transcribeVoice(
  token: string,
  sessionId: string,
  transcript: string,
): Promise<{ transcript: string }> {
  return apiClient(apiUrl(`/api/sessions/${sessionId}/voice/transcribe`), {
    method: 'POST',
    token,
    body: { transcript },
  });
}

export interface VoiceReply {
  transcript: string;
  text: string;
  crisis: import('@/entities/session').CrisisInfo | null;
  audio: { audioBase64: string; mimeType: 'audio/mpeg' } | null;
  audioAvailable: boolean;
  voiceConfigured: boolean;
}

export async function replyToVoice(
  token: string,
  sessionId: string,
  transcript: string,
): Promise<VoiceReply> {
  return apiClient(apiUrl(`/api/sessions/${sessionId}/voice/reply`), {
    method: 'POST',
    token,
    body: { transcript },
  });
}
