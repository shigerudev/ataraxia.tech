export type UserRole = 'psychologist' | 'patient' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface UserCredentials extends User {
  passwordHash: string;
}
