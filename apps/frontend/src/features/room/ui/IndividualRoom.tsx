import { useEffect } from 'react';
import { ConversationProvider } from '@elevenlabs/react';
import { ELEVENLABS_AGENT_ID, ELEVENLABS_AGENT_ID_INDIVIDUAL } from '@/shared/config';
import { useTherapyFlow } from '@/features/session';
import { useRoomVoice, type RoomVoiceSession } from '../model/useRoomVoice';
import { RoomOrb, type RoomOrbState } from './RoomOrb';
import { RoomShell } from './RoomShell';

const AGENT_ID = ELEVENLABS_AGENT_ID_INDIVIDUAL || ELEVENLABS_AGENT_ID;

function orbState(session: RoomVoiceSession): RoomOrbState {
  if (session.status === 'error') return 'error';
  if (session.status === 'active') return session.isSpeaking ? 'speaking' : 'listening';
  return 'connecting';
}

function statusText(session: RoomVoiceSession): string {
  switch (session.status) {
    case 'active':
      return session.isSpeaking ? 'Ataraxia está hablando…' : 'Te escucho…';
    case 'error':
      return 'No fue posible iniciar el audio de la sala.';
    case 'ended':
      return 'Sesión finalizada.';
    default:
      return 'Conectando con tu acompañante…';
  }
}

function AgentIndividualRoom({ alias }: { alias: string | null }) {
  const { leaveRoom } = useTherapyFlow();
  const session = useRoomVoice();

  useEffect(() => {
    if (session.status === 'ended') leaveRoom();
  }, [session.status, leaveRoom]);

  return (
    <RoomShell
      title="Sesión individual"
      subtitle={alias ? `Participas como ${alias}` : 'Acompañamiento por voz'}
      live={session.status === 'active'}
      isMuted={session.isMuted}
      onToggleMute={session.toggleMute}
      micDisabled={session.status !== 'active'}
      onLeave={session.stop}
      leaveLabel="Colgar"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <RoomOrb state={orbState(session)} getLevel={session.getLevel} />
        <div aria-live="polite" className="flex flex-col items-center gap-2">
          <p className="font-display text-xl font-semibold tracking-tight text-navy">
            {statusText(session)}
          </p>
          {session.status === 'error' && (
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {session.error ?? 'Revisa los permisos del micrófono e intenta de nuevo.'}
            </p>
          )}
        </div>
      </div>
    </RoomShell>
  );
}

/** Sala individual sin agente configurado: mensaje claro y salida. */
function UnconfiguredRoom({ alias, onLeave }: { alias: string | null; onLeave: () => void }) {
  return (
    <RoomShell
      title="Sesión individual"
      subtitle={alias ? `Participas como ${alias}` : undefined}
      onLeave={onLeave}
      leaveLabel="Salir"
    >
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <RoomOrb state="connecting" getLevel={() => 0} />
        <p className="font-display text-lg font-semibold text-navy">
          El acompañamiento por voz aún no está configurado
        </p>
        <p className="text-sm leading-relaxed text-muted">
          Define <code className="rounded bg-bg px-1.5 py-0.5">VITE_ELEVENLABS_AGENT_ID_INDIVIDUAL</code>{' '}
          para habilitar la conversación en vivo.
        </p>
      </div>
    </RoomShell>
  );
}

export function IndividualRoom() {
  const { alias, leaveRoom } = useTherapyFlow();

  if (!AGENT_ID) {
    return <UnconfiguredRoom alias={alias} onLeave={leaveRoom} />;
  }

  return (
    <ConversationProvider agentId={AGENT_ID}>
      <AgentIndividualRoom alias={alias} />
    </ConversationProvider>
  );
}
