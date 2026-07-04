import type { User, UserCredentials } from '../entities/User.js';

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;
  findCredentialsByEmail(email: string): Promise<UserCredentials | null>;
  countUsers(): Promise<number>;
  createUser(user: UserCredentials): Promise<void>;
}
