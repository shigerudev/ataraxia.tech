import type { User } from '../../domain/entities/User.js';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: User;
}

export interface MeResponseDto {
  user: User;
}
