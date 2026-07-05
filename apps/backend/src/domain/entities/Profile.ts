export type TherapyModality = 'individual' | 'grupal';
export type JoinMode = 'now' | 'scheduled';

export interface Profile {
  id: string;
  aliasAnonimo: string;
  email: string | null;
  phone: string | null;
  clinicalSummary: Record<string, unknown> | null;
  modalidad: TherapyModality | null;
  joinMode: JoinMode | null;
  scheduledAt: string | null;
  createdAt: string;
}
