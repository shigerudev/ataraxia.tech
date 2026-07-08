import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ensureAnonymousSession } from '@/shared/supabase/client';
import type {
  CrisisInfo,
  JoinMode,
  RiskLevel,
  SessionChannel,
  TherapyModality,
} from '@/entities/session';
import {
  closeSession,
  createSession,
  type RegistrationPayload,
  type SessionEvaluationPayload,
} from '../api/sessionApi';

export type FlowStep =
  | 'welcome'
  | 'chat'
  | 'crisis'
  | 'evaluation'
  | 'registration'
  | 'scheduling'
  | 'room'
  | 'thankyou';

interface FlowState {
  step: FlowStep;
  channel: SessionChannel | null;
  sessionId: string | null;
  accessToken: string | null;
  riskLevel: RiskLevel | null;
  crisisInfo: CrisisInfo | null;
  sessionEvaluation: SessionEvaluationPayload | null;
  // Datos capturados en el registro, resueltos al confirmar la agenda.
  pendingRegistration: RegistrationPayload | null;
  alias: string | null;
  modalidad: TherapyModality | null;
  joinMode: JoinMode | null;
  scheduledAt: string | null;
  roomId: string | null;
  loading: boolean;
  error: string | null;
}

interface FlowContextValue extends FlowState {
  acceptConsent: () => Promise<void>;
  reportCrisis: (crisis: CrisisInfo) => void;
  goToEvaluation: () => void;
  submitSessionEvaluation: (payload: SessionEvaluationPayload) => void;
  goToScheduling: (payload: RegistrationPayload) => void;
  joinNow: () => Promise<void>;
  scheduleForLater: (scheduledAt: string) => Promise<void>;
  leaveRoom: () => void;
  reset: () => void;
}

const initialState: FlowState = {
  step: 'welcome',
  channel: null,
  sessionId: null,
  accessToken: null,
  riskLevel: null,
  crisisInfo: null,
  sessionEvaluation: null,
  pendingRegistration: null,
  alias: null,
  modalidad: null,
  joinMode: null,
  scheduledAt: null,
  roomId: null,
  loading: false,
  error: null,
};

const FlowContext = createContext<FlowContextValue | null>(null);

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
}

export function TherapyFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FlowState>(initialState);

  const patch = useCallback((next: Partial<FlowState>) => {
    setState((prev) => ({ ...prev, ...next }));
  }, []);

  // El consentimiento crea la sesión anónima y entra directo a la conversación
  // (canal fijo 'chat'; la voz vive dentro del propio chat).
  const acceptConsent = useCallback(async () => {
    patch({ loading: true, error: null });
    try {
      const accessToken = await ensureAnonymousSession();
      const { session } = await createSession(accessToken, 'chat');
      patch({
        accessToken,
        sessionId: session.id,
        channel: 'chat',
        step: 'chat',
        loading: false,
      });
    } catch (err) {
      patch({ loading: false, error: errorMessage(err) });
    }
  }, [patch]);

  const reportCrisis = useCallback(
    (crisis: CrisisInfo) => {
      patch({ crisisInfo: crisis, riskLevel: 'high', step: 'crisis' });
    },
    [patch],
  );

  const goToEvaluation = useCallback(() => {
    patch({ step: 'evaluation', error: null });
  }, [patch]);

  const submitSessionEvaluation = useCallback(
    (payload: SessionEvaluationPayload) => {
      patch({ step: 'registration', sessionEvaluation: payload, error: null });
    },
    [patch],
  );

  // El registro ya no cierra la sesión: guarda los datos y pasa a la agenda.
  const goToScheduling = useCallback(
    (payload: RegistrationPayload) => {
      patch({
        step: 'scheduling',
        pendingRegistration: payload,
        alias: payload.aliasAnonimo,
        modalidad: payload.modalidad ?? 'individual',
        error: null,
      });
    },
    [patch],
  );

  const finalize = useCallback(
    async (extra: Pick<RegistrationPayload, 'joinMode' | 'scheduledAt'>) => {
      if (!state.accessToken || !state.sessionId || !state.pendingRegistration) return null;
      const payload: RegistrationPayload = {
        ...state.pendingRegistration,
        ...extra,
        clinicalSummary: {
          ...(state.pendingRegistration.clinicalSummary ?? {}),
          ...(state.sessionEvaluation ? { sessionEvaluation: state.sessionEvaluation } : {}),
        },
      };
      await closeSession(state.accessToken, state.sessionId, payload);
      return payload;
    },
    [state.accessToken, state.sessionId, state.pendingRegistration, state.sessionEvaluation],
  );

  const joinNow = useCallback(async () => {
    patch({ loading: true, error: null });
    try {
      const payload = await finalize({ joinMode: 'now', scheduledAt: undefined });
      if (!payload) {
        patch({ loading: false, error: 'Tu sesión expiró. Vuelve a comenzar, por favor.' });
        return;
      }
      const modalidad = payload.modalidad ?? 'individual';
      // Sala grupal estable para que quien entre "ahora" coincida; la individual
      // es 1:1 con el agente de voz, sin malla WebRTC.
      const roomId =
        modalidad === 'grupal' ? 'group:general' : `indiv:${state.sessionId ?? 'me'}`;
      patch({ step: 'room', joinMode: 'now', roomId, loading: false });
    } catch (err) {
      patch({ loading: false, error: errorMessage(err) });
    }
  }, [finalize, patch, state.sessionId]);

  const scheduleForLater = useCallback(
    async (scheduledAt: string) => {
      patch({ loading: true, error: null });
      try {
        const payload = await finalize({ joinMode: 'scheduled', scheduledAt });
        if (!payload) {
          patch({ loading: false, error: 'Tu sesión expiró. Vuelve a comenzar, por favor.' });
          return;
        }
        patch({ step: 'thankyou', joinMode: 'scheduled', scheduledAt, loading: false });
      } catch (err) {
        patch({ loading: false, error: errorMessage(err) });
      }
    },
    [finalize, patch],
  );

  const leaveRoom = useCallback(() => {
    patch({ step: 'thankyou', roomId: null });
  }, [patch]);

  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo<FlowContextValue>(
    () => ({
      ...state,
      acceptConsent,
      reportCrisis,
      goToEvaluation,
      submitSessionEvaluation,
      goToScheduling,
      joinNow,
      scheduleForLater,
      leaveRoom,
      reset,
    }),
    [
      state,
      acceptConsent,
      reportCrisis,
      goToEvaluation,
      submitSessionEvaluation,
      goToScheduling,
      joinNow,
      scheduleForLater,
      leaveRoom,
      reset,
    ],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useTherapyFlow(): FlowContextValue {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useTherapyFlow must be used within TherapyFlowProvider');
  return ctx;
}
