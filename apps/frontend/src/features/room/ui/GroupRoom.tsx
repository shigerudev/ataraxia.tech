import { useEffect, useRef } from 'react';
import { IconUsers } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';
import { useGroupRoom, type RemoteAudio } from '../model/useGroupRoom';
import { ParticipantTile } from './ParticipantTile';
import { RoomShell } from './RoomShell';

/**
 * Reproduce el audio de un par remoto (no se puede asignar srcObject en JSX).
 * Además de la reproducción, estos elementos son imprescindibles para el
 * puente de la facilitadora: en Chrome un MediaStream remoto es silencioso
 * dentro de WebAudio si no está adjunto a un elemento de audio
 * (crbug.com/933677). No desmontarlos mientras la sala viva.
 */
function RemoteAudioSink({ audio }: { readonly audio: RemoteAudio }) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = audio.stream;
    void el.play().catch(() => undefined);
  }, [audio.stream]);
  return <audio ref={ref} autoPlay playsInline />;
}

export function GroupRoom() {
  const { alias, roomId, leaveRoom } = useTherapyFlow();
  const session = useGroupRoom(roomId ?? 'group:general', alias ?? 'Anónimo');

  function handleLeave() {
    session.leave();
    leaveRoom();
  }

  const { facilitator } = session;
  const count = session.participants.length;
  let subtitle: string;
  if (session.status !== 'connected') {
    subtitle = 'Conectando con la sala…';
  } else if (facilitator.active) {
    subtitle = 'Sesión guiada por Ataraxia · comparte con respeto y confidencialidad';
  } else {
    subtitle = 'Sala grupal en vivo · comparte con respeto y confidencialidad';
  }

  const humanCount = session.participants.filter((p) => p.kind === 'human').length;

  return (
    <RoomShell
      title="Sala grupal"
      subtitle={subtitle}
      live={session.status === 'connected'}
      meta={
        <span className="inline-flex items-center gap-1.5">
          <IconUsers className="h-4 w-4" />
          {count} {count === 1 ? 'participante' : 'participantes'}
        </span>
      }
      isMuted={session.isMuted}
      onToggleMute={session.toggleMute}
      micDisabled={session.status !== 'connected'}
      onLeave={handleLeave}
      leaveLabel="Salir"
    >
      {session.status === 'error' ? (
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <p className="font-display text-lg font-semibold text-navy">No pudimos conectarte</p>
          <p className="text-sm leading-relaxed text-muted">
            {session.error ?? 'Revisa los permisos del micrófono e intenta de nuevo.'}
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-6">
          {humanCount <= 1 && session.status === 'connected' && (
            <p className="text-sm text-muted">
              {facilitator.active
                ? 'Ataraxia te acompaña mientras se une el resto del grupo.'
                : 'Aún estás solo/a en la sala. Cuando alguien más entre, aparecerá aquí.'}
            </p>
          )}
          <div className="room-grid">
            {session.participants.map((p) => (
              <ParticipantTile key={p.peerId} participant={p} />
            ))}
          </div>
        </div>
      )}

      <div className="sr-only" aria-hidden="true">
        {session.remoteAudios.map((audio) => (
          <RemoteAudioSink key={audio.peerId} audio={audio} />
        ))}
      </div>
    </RoomShell>
  );
}
