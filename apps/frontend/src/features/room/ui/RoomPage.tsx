import { useTherapyFlow } from '@/features/session';
import { GroupRoom } from './GroupRoom';
import { IndividualRoom } from './IndividualRoom';

/** Punto de entrada de la sala: elige individual (voz IA) o grupal (WebRTC). */
export function RoomPage() {
  const { modalidad } = useTherapyFlow();
  return modalidad === 'grupal' ? <GroupRoom /> : <IndividualRoom />;
}
