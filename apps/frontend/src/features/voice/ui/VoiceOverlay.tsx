import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ConversationProvider } from '@elevenlabs/react';
import { ELEVENLABS_AGENT_ID } from '@/shared/config';
import { useAgentVoice } from '../model/useAgentVoice';
import { useDemoVoice } from '../model/useDemoVoice';
import type { VoiceTranscriptHandler } from '../model/types';
import { VoicePanel } from './VoicePanel';

interface VoiceOverlayProps {
  /** Recibe las transcripciones de la conversación de voz para el hilo del chat. */
  onTranscript: VoiceTranscriptHandler;
  onClose: () => void;
}

/* Los hooks del SDK solo funcionan dentro de ConversationProvider, por lo que
   cada implementación vive en su propio componente y la selección se hace por
   composición (nunca con hooks condicionales). */

function AgentVoicePanel({ onClose }: { onClose: () => void }) {
  const session = useAgentVoice();
  return <VoicePanel session={session} onClose={onClose} />;
}

function DemoVoicePanel({ onClose }: { onClose: () => void }) {
  const session = useDemoVoice();
  return <VoicePanel session={session} onClose={onClose} />;
}

function VoicePortal({ children }: { children: ReactNode }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(children, document.body);
}

/**
 * Punto de entrada del modo voz. Con VITE_ELEVENLABS_AGENT_ID definido monta
 * la conversación real con ElevenLabs; sin él, el modo demostración (micrófono
 * local solo para animar el orbe).
 */
export function VoiceOverlay({ onTranscript, onClose }: VoiceOverlayProps) {
  if (!ELEVENLABS_AGENT_ID) {
    return (
      <VoicePortal>
        <DemoVoicePanel onClose={onClose} />
      </VoicePortal>
    );
  }

  return (
    <VoicePortal>
      <ConversationProvider
        agentId={ELEVENLABS_AGENT_ID}
        onMessage={({ role, message }) => {
          void onTranscript(role === 'user' ? 'user' : 'assistant', message);
        }}
      >
        <AgentVoicePanel onClose={onClose} />
      </ConversationProvider>
    </VoicePortal>
  );
}
