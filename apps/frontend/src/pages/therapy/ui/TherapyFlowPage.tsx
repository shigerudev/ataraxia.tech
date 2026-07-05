import { TherapyFlowProvider, useTherapyFlow, type FlowStep } from '@/features/session';
import { ChatWindow } from '@/features/chat';
import { CrisisOverlay } from '@/features/crisis';
import { RegistrationForm } from '@/features/registration';
import { WelcomePage } from '@/pages/welcome';
import { ModeSelectPage } from '@/pages/mode-select';
import { ThankYouPage } from '@/pages/thank-you';
import { BrandLogo, IconLock } from '@/shared/ui';

const PROGRESS_STEPS = ['Bienvenida', 'Modalidad', 'Conversación', 'Registro'];

function progressIndex(step: FlowStep): number {
  switch (step) {
    case 'welcome':
      return 0;
    case 'mode':
      return 1;
    case 'chat':
    case 'crisis':
      return 2;
    case 'registration':
      return 3;
    default:
      return PROGRESS_STEPS.length;
  }
}

function StepProgress({ step }: { step: FlowStep }) {
  const current = progressIndex(step);
  if (current >= PROGRESS_STEPS.length) return null;

  return (
    <nav aria-label={`Paso ${current + 1} de ${PROGRESS_STEPS.length}`} className="mb-6">
      <ol className="flex items-start gap-2">
        {PROGRESS_STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <span
              className={`block h-1.5 rounded-full transition ${
                i <= current ? 'bg-navy' : 'bg-navy/10'
              }`}
            />
            <span
              className={`mt-1.5 hidden text-xs font-medium sm:block ${
                i === current ? 'text-navy' : 'text-muted'
              }`}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function FlowStepView() {
  const { step } = useTherapyFlow();

  switch (step) {
    case 'welcome':
      return <WelcomePage />;
    case 'mode':
      return <ModeSelectPage />;
    case 'chat':
    case 'crisis':
      return <ChatWindow />;
    case 'registration':
      return <RegistrationForm />;
    case 'thankyou':
      return <ThankYouPage />;
    default:
      return <WelcomePage />;
  }
}

function FlowContainer() {
  const { step, crisisInfo } = useTherapyFlow();
  const isChat = step === 'chat' || step === 'crisis';
  const width = isChat ? 'max-w-3xl' : 'max-w-2xl';

  return (
    <div className="flex min-h-dvh flex-col bg-bg bg-aurora bg-no-repeat">
      <header>
        <div className={`mx-auto flex w-full items-center justify-between px-5 py-6 ${width}`}>
          <BrandLogo />
          <span className="chip-outline hidden sm:inline-flex">
            <IconLock className="h-3.5 w-3.5" />
            Espacio confidencial
          </span>
        </div>
      </header>

      <main className={`mx-auto flex w-full flex-1 flex-col px-5 pb-10 ${width}`}>
        <StepProgress step={step} />
        <div className={isChat ? 'flex flex-1 flex-col' : ''}>
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
