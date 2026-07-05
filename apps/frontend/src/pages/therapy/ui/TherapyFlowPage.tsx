import { lazy, Suspense } from 'react';
import { TherapyFlowProvider, useTherapyFlow, type FlowStep } from '@/features/session';
import { ChatWindow } from '@/features/chat';
import { CrisisOverlay } from '@/features/crisis';
import { RegistrationForm } from '@/features/registration';
import { WelcomePage } from '@/pages/welcome';
import { SchedulePage } from '@/pages/schedule';
import { ThankYouPage } from '@/pages/thank-you';
import { BrandLogo, IconLock } from '@/shared/ui';

// La sala arrastra el SDK de voz (ElevenLabs) y WebRTC: solo se descarga al entrar.
const RoomPage = lazy(() => import('@/features/room').then((m) => ({ default: m.RoomPage })));

const PROGRESS_STEPS = ['Bienvenida', 'Conversación', 'Registro', 'Agenda'];

function progressIndex(step: FlowStep): number {
  switch (step) {
    case 'welcome':
      return 0;
    case 'chat':
    case 'crisis':
      return 1;
    case 'registration':
      return 2;
    case 'scheduling':
      return 3;
    default:
      return PROGRESS_STEPS.length;
  }
}

function StepProgress({ step }: { step: FlowStep }) {
  const current = progressIndex(step);
  if (current >= PROGRESS_STEPS.length) return null;

  return (
    <nav aria-label={`Paso ${current + 1} de ${PROGRESS_STEPS.length}`} className="mb-5 sm:mb-6">
      <ol className="flex items-start gap-2">
        {PROGRESS_STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <span className="block h-1.5 overflow-hidden rounded-full bg-primary/10">
              {i <= current && (
                <span className="block h-full w-full origin-left rounded-full bg-brand animate-fill-x" />
              )}
            </span>
            <span
              className={`mt-1.5 hidden text-xs font-medium sm:block ${
                i === current ? 'text-primary-dark' : 'text-muted'
              }`}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs font-medium text-muted sm:hidden">
        Paso {current + 1} de {PROGRESS_STEPS.length} ·{' '}
        <span className="text-primary-dark">{PROGRESS_STEPS[current]}</span>
      </p>
    </nav>
  );
}

function FlowStepView() {
  const { step } = useTherapyFlow();

  switch (step) {
    case 'welcome':
      return <WelcomePage />;
    case 'chat':
    case 'crisis':
      return <ChatWindow />;
    case 'registration':
      return <RegistrationForm />;
    case 'scheduling':
      return <SchedulePage />;
    case 'thankyou':
      return <ThankYouPage />;
    default:
      return <WelcomePage />;
  }
}

function FlowContainer() {
  const { step, crisisInfo } = useTherapyFlow();

  // La sala ocupa toda la pantalla (sin cabecera/pie/progreso del flujo).
  if (step === 'room') {
    return (
      <Suspense fallback={<div className="app-loading">Preparando tu sala…</div>}>
        <RoomPage />
      </Suspense>
    );
  }

  const isChat = step === 'chat' || step === 'crisis';
  const width = isChat ? 'max-w-3xl' : 'max-w-2xl';
  // Crisis mantiene montado el chat: comparten llave para no reiniciar la conversación.
  const viewKey = step === 'crisis' ? 'chat' : step;

  return (
    <div className="flex min-h-dvh flex-col bg-bg bg-aurora bg-no-repeat">
      <header>
        <div className={`mx-auto flex w-full items-center justify-between px-4 py-4 sm:px-5 sm:py-6 ${width}`}>
          <BrandLogo />
          <span className="chip-outline hidden sm:inline-flex">
            <IconLock className="h-3.5 w-3.5" />
            Espacio confidencial
          </span>
        </div>
      </header>

      <main className={`mx-auto flex min-h-0 w-full flex-1 flex-col px-4 pb-6 sm:px-5 sm:pb-10 ${width}`}>
        <StepProgress step={step} />
        <div key={viewKey} className={`animate-rise-in ${isChat ? 'flex min-h-0 flex-1 flex-col' : ''}`}>
          <FlowStepView />
        </div>
      </main>

      <footer className="border-t border-hairline/70 bg-white/60">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-1.5 px-5 py-4 text-center text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span>© {new Date().getFullYear()} Ataraxia · Acompañamiento emocional confidencial</span>
          <span>Este servicio no sustituye la atención profesional de salud mental.</span>
        </div>
      </footer>

      {step === 'crisis' && crisisInfo && <CrisisOverlay crisis={crisisInfo} />}
    </div>
  );
}

export function TherapyFlowPage() {
  return (
    <TherapyFlowProvider>
      <FlowContainer />
    </TherapyFlowProvider>
  );
}
