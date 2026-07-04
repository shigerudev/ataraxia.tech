import type { User, UserCredentials } from '../../domain/entities/User.js';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository.js';
import type { IPasswordHasher } from '../../domain/services/IPasswordHasher.js';

/**
 * Auth de STAFF temporal (psicólogos/admin), en memoria y sin base de datos.
 * El flujo de pacientes es anónimo vía Supabase; esto es solo para la consola de staff.
 * Se migrará a Supabase Auth en Fase 2.
 */
const STAFF_USERS: Omit<User, never>[] = [
  { id: 'staff-001', email: 'psicologo@ataraxia.tech', name: 'Dra. Ana García', role: 'psychologist' },
  { id: 'staff-002', email: 'admin@ataraxia.tech', name: 'Administración Ataraxia', role: 'admin' },
];

export class InMemoryStaffAuthRepository implements IAuthRepository {
  private users: UserCredentials[] = [];

  constructor(private readonly passwordHasher: IPasswordHasher) {}

  async seed(defaultPassword: string): Promise<void> {
    if (this.users.length > 0) return;
    const passwordHash = await this.passwordHasher.hash(defaultPassword);
    this.users = STAFF_USERS.map((u) => ({ ...u, passwordHash }));
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = this.users.find((u) => u.email === email.toLowerCase());
    return found ? this.toPublicUser(found) : null;
  }

  async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    return this.users.find((u) => u.email === email.toLowerCase()) ?? null;
  }

  async countUsers(): Promise<number> {
    return this.users.length;
  }

  async createUser(user: UserCredentials): Promise<void> {
    this.users.push(user);
  }

  private toPublicUser(credentials: UserCredentials): User {
    const { passwordHash: _passwordHash, ...user } = credentials;
    return user;
  }
}
