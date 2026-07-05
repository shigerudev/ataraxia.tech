import { TherapyFlowProvider, useTherapyFlow } from '@/features/session';
import { ScreeningForm } from '@/features/screening';
import { ChatWindow } from '@/features/chat';
import { CrisisOverlay } from '@/features/crisis';
import { RegistrationForm } from '@/features/registration';
import { WelcomePage } from '@/pages/welcome';
import { ModeSelectPage } from '@/pages/mode-select';
import { ThankYouPage } from '@/pages/thank-you';

function FlowStepView() {
  const { step } = useTherapyFlow();

  switch (step) {
    case 'welcome':
      return <WelcomePage />;
    case 'mode':
      return <ModeSelectPage />;
    case 'screening':
      return <ScreeningForm />;
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
  const wide = step === 'chat' || step === 'crisis';

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 py-8 md:py-12"
      style={{
        background:
          'radial-gradient(1100px 560px at 50% -10%, #E7E5FA, transparent), #F3F2FB',
      }}
    >
      <span className="flex items-center gap-2 font-display font-bold text-xl text-navy mb-8">
        <span className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-navy to-indigo-500" />
        Ataraxia
      </span>

      <main className={`w-full ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}>
        <FlowStepView />
      </main>

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
