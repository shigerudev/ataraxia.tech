# Spec: Live Session Rooms

## Status

`active` (individual voice + group mesh + AI group facilitator implemented)

## Objective

After registration and scheduling, let a user immediately enter a live
"acompañamiento" room. Individual sessions are a 1:1 voice conversation with an
ElevenLabs agent; group sessions are a shared audio room (Zoom/Teams-like)
**led live by an ElevenLabs AI facilitator**, where participants hear each
other and the facilitator, and see a roster of aliases in real time.

## Scope

Included:

- A full-screen room step (`room`) in the therapy flow state machine.
- Individual room: reuse ElevenLabs Conversational AI with a distinct public
  agent id (`VITE_ELEVENLABS_AGENT_ID_INDIVIDUAL`).
- Group room: real human-to-human audio via a raw WebRTC mesh, signaled by
  Supabase Realtime; live participant roster via Supabase Presence.
- AI group facilitator (`VITE_ELEVENLABS_AGENT_ID_GROUP`): the mesh host (the
  peer with the smallest `peerId`) bridges an ElevenLabs agent into the room
  (`FacilitatorBridge`). The agent hears the whole room (host mic + every
  remote stream mixed via WebAudio, PCM16 over the agents WebSocket) and its
  voice reaches every participant mixed into the host's outgoing track
  (`RTCRtpSender.replaceTrack`, no renegotiation). Roster changes are sent to
  the agent as non-interrupting `contextual_update`s so it can greet/say
  goodbye. Facilitator state (active/speaking) is broadcast so every client
  renders its tile.
- Mute and leave controls; speaking indicator (best-effort).

Excluded (deferred):

- SFU/media server for large groups (mesh only; capped at 8 participants).
- Recording or persistence of audio.
- Real-name exposure: only aliases are shared.
- Private-agent auth (backend signed URL) for the facilitator.

## User Flow

1. User finishes registration and picks a modality.
2. In `scheduling`, user chooses "Unirme ahora mismo".
3. The session is closed with `joinMode = 'now'` and the flow enters `room`.
4. Individual: the ElevenLabs conversation starts; user talks 1:1 with the agent.
5. Group: the browser requests the microphone, joins a stable room
   (`group:general`), and connects to every present peer (mesh).
6. The elected host connects the AI facilitator; its tile appears first in the
   roster ("Ataraxia · Facilitadora IA") and it starts leading the session.
7. As other users join, their alias tiles appear/disappear live (Presence) and
   the facilitator is informed via contextual updates.
8. If the host leaves, the next smallest `peerId` is promoted and re-bridges
   the facilitator (a brief gap in the facilitator's audio is expected).
9. Leaving closes peer connections, untracks presence, and returns to thank-you.

## Functional Requirements

- Group participants are identified only by their anonymous alias.
- The room is full-screen and bypasses the standard flow chrome.
- Mesh initiation is deterministic (smaller `peerId` offers) to avoid glare.
- Host election is deterministic (smallest `peerId` bridges the facilitator);
  a new host waits a short grace period before starting to avoid duplicates.
- ElevenLabs API key must never reach the frontend (public agent id only; use a
  backend signed URL for private agents).
- Muting the host silences their mic toward peers AND toward the facilitator,
  but the facilitator's voice keeps flowing to the room.
- Audio failures degrade to a readable message with a way to leave; if the
  facilitator cannot connect (after 2 retries), the room continues
  human-to-human.
- The facilitator agent must output PCM audio (the ElevenLabs agents WebSocket
  emits PCM/u-law only; u-law is rejected by the bridge).

## Non-Functional Requirements

- Mesh targets small groups: hard cap `MAX_PARTICIPANTS = 8` (excess joiners,
  by deterministic peerId order, are turned away with a readable message).
- Presence/Broadcast require Realtime enabled on the Supabase project.
- Reuse the "Sinapsis" design system (no new colors/tokens).
- The host tab is a single point of failure for the facilitator; handoff is
  automatic but not seamless.

## Technical Contracts

Frontend:

- `features/room` slice: `RoomPage` (dispatch by modality), `RoomShell`,
  `IndividualRoom` + `useRoomVoice`, `GroupRoom` + `useGroupRoom`,
  `ParticipantTile`, `facilitatorBridge` (host-side agent bridge).
- Signaling channel: `supabase.channel(roomId)` with `presence.key = peerId`,
  Broadcast event `signal` carrying `{ from, to, kind: 'offer'|'answer'|'ice', data }`.
  ICE candidates arriving before `remoteDescription` are queued per peer.
- Broadcast event `facilitator` carrying `{ from, active, speaking }` (host →
  everyone; re-sent on presence joins so late joiners get the state).
- Presence meta: `{ peerId, alias, muted }`.
- Facilitator bridge: `WebSocketConnection` from `@elevenlabs/client` (re-served
  by `@elevenlabs/react`) — negotiates formats, sends `user_audio_chunk`
  (base64 PCM16 mono at the agent's input rate), answers `ping` with `pong`,
  flushes local playback on `interruption`, and forwards roster changes via
  `contextual_update`. Capture runs in an `AudioContext` at the agent's input
  rate (AudioWorklet, ScriptProcessor fallback). The host's local monitor of
  the agent plays through an `<audio>` element (not `ctx.destination`) so
  Chromium's echo canceller sees it — otherwise the agent hears itself.
- Chrome caveat: remote WebRTC streams are silent inside WebAudio unless also
  attached to a media element (crbug.com/933677) — the `RemoteAudioSink`
  elements in `GroupRoom` must stay mounted while the room lives.

Environment:

- `VITE_ELEVENLABS_AGENT_ID_INDIVIDUAL` (public, individual room).
- `VITE_ELEVENLABS_AGENT_ID_GROUP` (public, group facilitator; empty = group
  room runs human-to-human only).
- STUN: `stun:stun.l.google.com:19302`; optional TURN via `VITE_TURN_URL`,
  `VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL` for restrictive networks.

## Acceptance Criteria

- [ ] Choosing "join now" for individual opens a 1:1 ElevenLabs voice room.
- [ ] Choosing "join now" for group opens a shared audio room.
- [ ] With `VITE_ELEVENLABS_AGENT_ID_GROUP` set, the facilitator tile appears
      and every participant hears the agent lead the session.
- [ ] The facilitator hears and responds to any participant, not only the host.
- [ ] A second participant joining appears in the roster with their alias, live,
      and the facilitator acknowledges the change (contextual update).
- [ ] Participants can hear each other and mute/leave.
- [ ] Host leaving promotes a new host and the facilitator returns.
- [ ] Leaving tears down peer connections, presence and the bridge.

## Risks

- Mesh does not scale beyond a handful of participants (capped at 8).
- No TURN server by default: peers behind symmetric NAT may fail to connect.
- Group audio has higher privacy/moderation requirements (clinical review).
- The Realtime channel is public to any holder of the anon key: presence metas
  and signals can be spoofed (alias impersonation, signaling interference).
  Mitigated only lightly client-side; needs Supabase Realtime Authorization
  (private channels + RLS) or server-issued room tokens before broader rollout.
- Host-side bridging exposes the facilitator to the host's connection quality;
  handoff on host loss produces a brief facilitator gap.

## Implementation Plan

1. Add `scheduling` and `room` steps to the flow (done).
2. Build the scheduling UI + join-now/schedule actions (done).
3. Implement individual and group rooms (done).
4. Add TURN configuration for reliability (env seam done; server provisioning
   pending).
5. Phase 2: add the AI facilitator as a room participant (done — host-bridged).
6. Phase 3 (next): private channels / Realtime Authorization; server-side
   facilitator (SFU or backend peer) to remove the host single point of failure.
