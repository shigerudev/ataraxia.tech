import { TherapyFlowProvider, useTherapyFlow } from '@/features/session';
import { ScreeningForm } from '@/features/screening';
import { ChatWindow } from '@/features/chat';
import { CrisisOverlay } from '@/features/crisis';
import { RegistrationForm } from '@/features/registration';
import { WelcomePage } from '@/pages/welcome';
import { ModeSelectPage } from '@/pages/mode-select';
import { ThankYouPage } from '@/pages/thank-you';
import './TherapyFlowPage.css';

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
    <div className="flow">
      <main className={`flow__main ${wide ? 'flow__main--wide' : ''}`}>
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
