# Spec: Live Session Rooms

## Status

`active` (individual voice + group mesh implemented; AI group facilitator deferred)

## Objective

After registration and scheduling, let a user immediately enter a live
"acompañamiento" room. Individual sessions are a 1:1 voice conversation with an
ElevenLabs agent; group sessions are a shared audio room (Zoom/Teams-like) where
participants hear each other and see a roster of aliases in real time.

## Scope

Included:

- A full-screen room step (`room`) in the therapy flow state machine.
- Individual room: reuse ElevenLabs Conversational AI with a distinct public
  agent id (`VITE_ELEVENLABS_AGENT_ID_INDIVIDUAL`).
- Group room: real human-to-human audio via a raw WebRTC mesh, signaled by
  Supabase Realtime; live participant roster via Supabase Presence.
- Mute and leave controls; speaking indicator (best-effort).

Excluded (deferred):

- AI facilitator joining the group room (reserved
  `VITE_ELEVENLABS_AGENT_ID_GROUP`, phase 2).
- SFU/media server for large groups (mesh only; small groups).
- Recording or persistence of audio.
- Real-name exposure: only aliases are shared.

## User Flow

1. User finishes registration and picks a modality.
2. In `scheduling`, user chooses "Unirme ahora mismo".
3. The session is closed with `joinMode = 'now'` and the flow enters `room`.
4. Individual: the ElevenLabs conversation starts; user talks 1:1 with the agent.
5. Group: the browser requests the microphone, joins a stable room
   (`group:general`), and connects to every present peer (mesh).
6. As other users join, their alias tiles appear/disappear live (Presence).
7. Leaving closes peer connections, untracks presence, and returns to thank-you.

## Functional Requirements

- Group participants are identified only by their anonymous alias.
- The room is full-screen and bypasses the standard flow chrome.
- Mesh initiation is deterministic (smaller `peerId` offers) to avoid glare.
- ElevenLabs API key must never reach the frontend (public agent id only; use a
  backend signed URL for private agents).
- Audio failures degrade to a readable message with a way to leave.

## Non-Functional Requirements

- Mesh targets small groups; document the practical participant limit.
- Presence/Broadcast require Realtime enabled on the Supabase project.
- Reuse the "Sinapsis" design system (no new colors/tokens).

## Technical Contracts

Frontend:

- `features/room` slice: `RoomPage` (dispatch by modality), `RoomShell`,
  `IndividualRoom` + `useRoomVoice`, `GroupRoom` + `useGroupRoom`,
  `ParticipantTile`.
- Signaling channel: `supabase.channel(roomId)` with `presence.key = peerId`,
  Broadcast event `signal` carrying `{ from, to, kind: 'offer'|'answer'|'ice', data }`.
- Presence meta: `{ peerId, alias, muted }`.

Environment:

- `VITE_ELEVENLABS_AGENT_ID_INDIVIDUAL` (public, individual room).
- `VITE_ELEVENLABS_AGENT_ID_GROUP` (reserved, phase 2 facilitator).
- STUN: `stun:stun.l.google.com:19302` (add TURN for restrictive networks).

## Acceptance Criteria

- [ ] Choosing "join now" for individual opens a 1:1 ElevenLabs voice room.
- [ ] Choosing "join now" for group opens a shared audio room.
- [ ] A second participant joining appears in the roster with their alias, live.
- [ ] Participants can hear each other and mute/leave.
- [ ] Leaving tears down peer connections and presence.

## Risks

- Mesh does not scale beyond a handful of participants.
- No TURN server: peers behind symmetric NAT may fail to connect.
- Group audio has higher privacy/moderation requirements (clinical review).

## Implementation Plan

1. Add `scheduling` and `room` steps to the flow (done).
2. Build the scheduling UI + join-now/schedule actions (done).
3. Implement individual and group rooms (done).
4. Add TURN configuration for reliability.
5. Phase 2: add the AI facilitator as a room participant.
