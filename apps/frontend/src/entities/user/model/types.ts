export type UserRole = 'psychologist' | 'patient' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  psychologist: 'Psicólogo/a',
  patient: 'Paciente',
  admin: 'Administrador',
};
