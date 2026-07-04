import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository.js';
import type { IPasswordHasher } from '../../../domain/services/IPasswordHasher.js';
import type { User } from '../../../domain/entities/User.js';
import { env } from '../../config/env.js';

const SEED_USERS: User[] = [
  { id: 'usr-001', email: 'psicologo@ataraxia.tech', name: 'Dra. Ana García', role: 'psychologist' },
  { id: 'usr-002', email: 'paciente@ataraxia.tech', name: 'María López', role: 'patient' },
  { id: 'usr-003', email: 'admin@ataraxia.tech', name: 'Administración Ataraxia', role: 'admin' },
];

export async function seedUsers(
  authRepository: IAuthRepository,
  passwordHasher: IPasswordHasher,
): Promise<void> {
  const existing = await authRepository.countUsers();
  if (existing > 0) return;

  const passwordHash = await passwordHasher.hash(env.seedPassword);

  for (const user of SEED_USERS) {
    await authRepository.createUser({ ...user, passwordHash });
  }

  console.log(`[ataraxia-backend] seeded ${SEED_USERS.length} users (default password from env)`);
}
