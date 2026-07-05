# Spec: Live Session Rooms

## Status

`active` for individual voice; group room and AI group facilitator are deferred.

## Objective

After registration and scheduling, let a user immediately enter an individual
1:1 voice room with an ElevenLabs agent. Group sessions remain specified for a
later phase and must not block the hackathon demo.

## Scope

Included:

- A full-screen room step (`room`) in the therapy flow state machine.
- Individual room: reuse ElevenLabs Conversational AI with a distinct public
  agent id (`VITE_ELEVENLABS_AGENT_ID_INDIVIDUAL`).
- Mute and leave controls; speaking indicator (best-effort).

Excluded (deferred):

- Group room: human-to-human audio via WebRTC mesh, Supabase Realtime presence,
  and all participant roster behavior.
- AI group facilitator (`VITE_ELEVENLABS_AGENT_ID_GROUP`) and host-side bridge.
- SFU/media server for large groups (mesh only; capped at 8 participants).
- Recording or persistence of audio.
- Real-name exposure: only aliases are shared.
- Private-agent auth (backend signed URL) for the facilitator.

## User Flow

1. User finishes registration and picks a modality.
2. In `scheduling`, user chooses "Unirme ahora mismo".
3. The session is closed with `joinMode = 'now'` and the flow enters `room`.
4. Individual: the ElevenLabs conversation starts; user talks 1:1 with the agent.
5. Leaving ends the ElevenLabs session and returns to thank-you.

## Functional Requirements

- The room is full-screen and bypasses the standard flow chrome.
- ElevenLabs API key must never reach the frontend (public agent id only; use a
  backend signed URL for private agents).
- Audio failures degrade to a readable message with a way to leave.

## Non-Functional Requirements

- Reuse the "Sinapsis" design system (no new colors/tokens).

## Technical Contracts

Frontend:

- `features/room` slice: `RoomPage` (dispatch by modality), `RoomShell`,
  `IndividualRoom` + `useRoomVoice`.

Environment:

- `VITE_ELEVENLABS_AGENT_ID_INDIVIDUAL` (public, individual room).
- `VITE_ELEVENLABS_AGENT_ID` may be used as fallback for the individual room.

## Acceptance Criteria

- [ ] Choosing "join now" for individual opens a 1:1 ElevenLabs voice room.
- [ ] Missing `VITE_ELEVENLABS_AGENT_ID_INDIVIDUAL` shows a clear configuration message.
- [ ] Muting and leaving work in the individual room.

## Risks

- Public agent IDs are visible in the frontend; use backend signed URLs before
  switching to private agents.
- Group audio has higher privacy/moderation requirements and remains deferred.

## Implementation Plan

1. Add `scheduling` and `room` steps to the flow (done).
2. Build the scheduling UI + join-now/schedule actions (done).
3. Implement individual room with ElevenLabs agent (current focus).
4. Defer group room, TURN configuration, AI facilitator, private channels, and
   server-side facilitator to later specs.
