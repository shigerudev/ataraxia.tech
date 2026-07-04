import { LoginUseCase } from '../domain/use-cases/LoginUseCase.js';
import type { IAuthRepository } from '../domain/repositories/IAuthRepository.js';
import { BcryptPasswordHasher } from './auth/BcryptPasswordHasher.js';
import { JwtService } from './auth/JwtService.js';
import { connectMongo } from './persistence/mongo/mongoClient.js';
import { MongoAuthRepository } from './persistence/MongoAuthRepository.js';

export interface AppContainer {
  authRepository: IAuthRepository;
  loginUseCase: LoginUseCase;
  jwtService: JwtService;
}

export async function buildContainer(): Promise<AppContainer> {
  const db = await connectMongo();

  const passwordHasher = new BcryptPasswordHasher();
  const authRepository = new MongoAuthRepository(db);

  const loginUseCase = new LoginUseCase(authRepository, passwordHasher);
  const jwtService = new JwtService();

  return { authRepository, loginUseCase, jwtService };
}
