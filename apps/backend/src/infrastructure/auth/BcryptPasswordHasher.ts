import bcrypt from 'bcryptjs';
import type { IPasswordHasher } from '../../domain/services/IPasswordHasher.js';
import { env } from '../config/env.js';

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, env.bcryptSaltRounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
