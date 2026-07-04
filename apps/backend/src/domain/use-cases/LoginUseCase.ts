import type { User } from '../entities/User.js';
import type { IAuthRepository } from '../repositories/IAuthRepository.js';
import type { IPasswordHasher } from '../services/IPasswordHasher.js';
import { InvalidCredentialsError } from '../errors/AuthErrors.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
}

export class LoginUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const email = input.email?.trim().toLowerCase();

    if (!email || !input.password) {
      throw new InvalidCredentialsError();
    }

    const credentials = await this.authRepository.findCredentialsByEmail(email);

    if (!credentials) {
      throw new InvalidCredentialsError();
    }

    const isValid = await this.passwordHasher.compare(input.password, credentials.passwordHash);

    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    const { passwordHash: _passwordHash, ...user } = credentials;
    return { user };
  }
}
