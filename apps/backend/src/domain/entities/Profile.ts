export type TherapyModality = 'individual' | 'grupal';

export interface Profile {
  id: string;
  aliasAnonimo: string;
  email: string | null;
  phone: string | null;
  diagnostico: Record<string, unknown> | null;
  modalidad: TherapyModality | null;
  createdAt: string;
}
