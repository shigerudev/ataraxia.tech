import type { Request, Response } from 'express';
import type { LoginUseCase } from '../../../domain/use-cases/LoginUseCase.js';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository.js';
import { InvalidCredentialsError } from '../../../domain/errors/AuthErrors.js';
import type { LoginRequestDto, AuthResponseDto, MeResponseDto } from '../../../application/dto/AuthDto.js';
import type { JwtService } from '../../auth/JwtService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: JwtService,
    private readonly authRepository: IAuthRepository,
  ) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as LoginRequestDto;
      const { user } = await this.loginUseCase.execute(body);
      const token = this.jwtService.sign(user);

      const response: AuthResponseDto = { token, user };
      res.json(response);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await this.authRepository.findByEmail(req.user!.email);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const response: MeResponseDto = { user };
    res.json(response);
  };
}
