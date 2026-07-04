import jwt from 'jsonwebtoken';
import type { User } from '../../domain/entities/User.js';
import { env } from '../config/env.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: User['role'];
}

export class JwtService {
  sign(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, env.jwtSecret, { expiresIn: '8h' });
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
  }
}
