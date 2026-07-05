import { ConversationProvider } from '@elevenlabs/react';
import { ELEVENLABS_AGENT_ID } from '@/shared/config';
import { useAgentVoice } from '../model/useAgentVoice';
import { useDemoVoice } from '../model/useDemoVoice';
import type { VoiceTranscriptHandler } from '../model/types';
import { VoicePanel } from './VoicePanel';

const VOICE_DEMO_TURN_TAKING_PROMPT =
  'Modo demo de hackathon: escucha a la persona hasta que termine su idea antes de responder. ' +
  'No interrumpas ni te adelantes si la persona hace pausas cortas, duda o respira entre frases. ' +
  'Espera una pausa clara antes de contestar. Cuando propongas continuidad, hazlo una sola vez y espera aceptación explícita del usuario.';

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

/**
 * Punto de entrada del modo voz. Con VITE_ELEVENLABS_AGENT_ID definido monta
 * la conversación real con ElevenLabs; sin él, el modo demostración (micrófono
 * local solo para animar el orbe).
 */
export function VoiceOverlay({ onTranscript, onClose }: VoiceOverlayProps) {
  if (!ELEVENLABS_AGENT_ID) {
    return <DemoVoicePanel onClose={onClose} />;
  }

  return (
    <ConversationProvider
      agentId={ELEVENLABS_AGENT_ID}
      overrides={{
        agent: {
          prompt: {
            prompt: VOICE_DEMO_TURN_TAKING_PROMPT,
          },
        },
      }}
      onMessage={({ role, message }) =>
        onTranscript(role === 'user' ? 'user' : 'assistant', message)
      }
    >
      <AgentVoicePanel onClose={onClose} />
    </ConversationProvider>
  );
}
