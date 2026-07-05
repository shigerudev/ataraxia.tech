import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ensureAnonymousSession } from '@/shared/supabase/client';
import type { CrisisInfo, RiskLevel, SessionChannel } from '@/entities/session';
import { closeSession, createSession, type RegistrationPayload } from '../api/sessionApi';

export type FlowStep =
  | 'welcome'
  | 'mode'
  | 'chat'
  | 'crisis'
  | 'registration'
  | 'thankyou';

interface FlowState {
  step: FlowStep;
  channel: SessionChannel | null;
  sessionId: string | null;
  accessToken: string | null;
  riskLevel: RiskLevel | null;
  crisisInfo: CrisisInfo | null;
  loading: boolean;
  error: string | null;
}

interface FlowContextValue extends FlowState {
  acceptConsent: () => void;
  selectMode: (channel: SessionChannel) => Promise<void>;
  reportCrisis: (crisis: CrisisInfo) => void;
  goToRegistration: () => void;
  register: (payload: RegistrationPayload) => Promise<void>;
  reset: () => void;
}

const initialState: FlowState = {
  step: 'welcome',
  channel: null,
  sessionId: null,
  accessToken: null,
  riskLevel: null,
  crisisInfo: null,
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

  const acceptConsent = useCallback(() => {
    patch({ step: 'mode', error: null });
  }, [patch]);

  const selectMode = useCallback(
    async (channel: SessionChannel) => {
      patch({ loading: true, error: null });
      try {
        const accessToken = await ensureAnonymousSession();
        const { session } = await createSession(accessToken, channel);
        patch({
          accessToken,
          sessionId: session.id,
          channel,
          step: 'chat',
          loading: false,
        });
      } catch (err) {
        patch({ loading: false, error: errorMessage(err) });
      }
    },
    [patch],
  );

  const reportCrisis = useCallback(
    (crisis: CrisisInfo) => {
      patch({ crisisInfo: crisis, riskLevel: 'high', step: 'crisis' });
    },
    [patch],
  );

  const goToRegistration = useCallback(() => {
    patch({ step: 'registration', error: null });
  }, [patch]);

  const register = useCallback(
    async (payload: RegistrationPayload) => {
      if (!state.accessToken || !state.sessionId) return;
      patch({ loading: true, error: null });
      try {
        await closeSession(state.accessToken, state.sessionId, payload);
        patch({ step: 'thankyou', loading: false });
      } catch (err) {
        patch({ loading: false, error: errorMessage(err) });
      }
    },
    [patch, state.accessToken, state.sessionId],
  );

  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo<FlowContextValue>(
    () => ({
      ...state,
      acceptConsent,
      selectMode,
      reportCrisis,
      goToRegistration,
      register,
      reset,
    }),
    [state, acceptConsent, selectMode, reportCrisis, goToRegistration, register, reset],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useTherapyFlow(): FlowContextValue {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useTherapyFlow must be used within TherapyFlowProvider');
  return ctx;
}
