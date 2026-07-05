import { LoginUseCase } from '../domain/use-cases/LoginUseCase.js';
import { CreateAnonymousSessionUseCase } from '../domain/use-cases/CreateAnonymousSessionUseCase.js';
import { SendMessageUseCase } from '../domain/use-cases/SendMessageUseCase.js';
import { CloseSessionUseCase } from '../domain/use-cases/CloseSessionUseCase.js';
import type { IAuthRepository } from '../domain/repositories/IAuthRepository.js';
import type { IAuthGateway } from '../domain/repositories/IAuthGateway.js';

import { BcryptPasswordHasher } from './auth/BcryptPasswordHasher.js';
import { JwtService } from './auth/JwtService.js';
import { InMemoryStaffAuthRepository } from './persistence/InMemoryStaffAuthRepository.js';
import { getServiceClient } from './persistence/supabase/supabaseClient.js';
import { SupabaseSessionRepository } from './persistence/SupabaseSessionRepository.js';
import { SupabaseKnowledgeRepository } from './persistence/SupabaseKnowledgeRepository.js';
import { SupabaseAuthGateway } from './auth/SupabaseAuthGateway.js';
import { OpenAiLlmService } from './ai/OpenAiLlmService.js';
import { OpenAiEmbeddingService } from './ai/OpenAiEmbeddingService.js';
import { RiskClassifier } from './safety/RiskClassifier.js';
import { CrisisProtocol } from './safety/CrisisProtocol.js';
import { CBT_SYSTEM_PROMPT } from './ai/prompts/cbtSystemPrompt.js';
import { ElevenLabsVoiceService } from './voice/ElevenLabsVoiceService.js';
import { env } from './config/env.js';

export interface FlowServices {
  authGateway: IAuthGateway;
  createSessionUseCase: CreateAnonymousSessionUseCase;
  sendMessageUseCase: SendMessageUseCase;
  closeSessionUseCase: CloseSessionUseCase;
  voiceService: ElevenLabsVoiceService;
}

export interface AppContainer {
  staffAuthRepository: IAuthRepository;
  loginUseCase: LoginUseCase;
  jwtService: JwtService;
  flow: FlowServices | null;
}

export async function buildContainer(): Promise<AppContainer> {
  // --- Auth de staff (temporal, en memoria) ---
  const passwordHasher = new BcryptPasswordHasher();
  const staffAuthRepository = new InMemoryStaffAuthRepository(passwordHasher);
  await staffAuthRepository.seed(env.staffPassword);
  const loginUseCase = new LoginUseCase(staffAuthRepository, passwordHasher);
  const jwtService = new JwtService();

  // --- Flujo clínico (Supabase + OpenAI) ---
  let flow: FlowServices | null = null;

  if (env.supabaseUrl && env.supabaseServiceRoleKey) {
    const client = getServiceClient();
    const sessionRepository = new SupabaseSessionRepository(client);
    const knowledgeRepository = new SupabaseKnowledgeRepository(client);
    const authGateway = new SupabaseAuthGateway(client);

    const llmService = new OpenAiLlmService();
    const embeddingService = new OpenAiEmbeddingService();
    const riskClassifier = new RiskClassifier(llmService);
    const crisisProtocol = new CrisisProtocol(env.crisisHotlines);
    const voiceService = new ElevenLabsVoiceService();

    flow = {
      authGateway,
      createSessionUseCase: new CreateAnonymousSessionUseCase(sessionRepository),
      sendMessageUseCase: new SendMessageUseCase({
        sessionRepository,
        knowledgeRepository,
        llmService,
        embeddingService,
        riskClassifier,
        crisisProtocol,
        cbtSystemPrompt: CBT_SYSTEM_PROMPT,
        ragMatchCount: env.ragMatchCount,
        ragMatchThreshold: env.ragMatchThreshold,
      }),
      closeSessionUseCase: new CloseSessionUseCase(sessionRepository),
      voiceService,
    };
  } else {
    console.warn(
      '[ataraxia-backend] Supabase no configurado: el flujo clínico (/api/sessions) está deshabilitado. ' +
        'Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en apps/backend/.env',
    );
  }

  return { staffAuthRepository, loginUseCase, jwtService, flow };
}
