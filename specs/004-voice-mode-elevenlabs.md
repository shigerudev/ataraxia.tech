# Spec: Voice Mode and ElevenLabs

## Status

`draft`

## Objective

Add voice interaction as a phase 2 modality where the user can speak, the system
transcribes the audio, routes text through the same safety and CBT flow, and
responds with generated speech.

## Scope

Included:

- Microphone capture in the frontend.
- Speech-to-text boundary.
- Reuse of existing message and crisis flow.
- Text-to-speech response generation with ElevenLabs.
- Server-only ElevenLabs API key usage.

Excluded:

- Live phone calls.
- Real-time therapist audio rooms.
- Voice cloning.
- Emergency voice dispatch.

## User Flow

1. User selects voice mode.
2. Browser requests microphone permission.
3. User records a message.
4. Backend receives or obtains transcript text.
5. Transcript passes crisis classification.
6. Assistant generates text response.
7. Backend sends text to ElevenLabs.
8. Frontend plays generated audio.

## Functional Requirements

- Voice mode must reuse the same risk checks as chat.
- Text transcript must be persisted as a user conversation turn.
- Assistant text must be persisted before or alongside audio response metadata.
- ElevenLabs key must never be sent to frontend code.
- User must have a clear way to stop recording/playback.

## Non-Functional Requirements

- Audio UI should be accessible and mobile-friendly.
- Audio failures should degrade to chat text.
- Do not store raw audio unless explicitly required by a future spec.
- Keep latency acceptable for a hackathon demo.

## Technical Contracts

Potential endpoints:

- `POST /api/sessions/:id/voice/transcribe`
- `POST /api/sessions/:id/voice/reply`

Environment:

- `ELEVENLABS_API_KEY`

Provider header:

- `xi-api-key`

## Acceptance Criteria

- [ ] User can choose voice mode.
- [ ] Microphone permission is handled.
- [ ] Transcript enters the same safety pipeline as chat.
- [ ] ElevenLabs audio is generated server-side.
- [ ] Failure to generate audio returns readable fallback text.

## Risks

- Browser microphone permissions may fail on demo devices.
- Audio APIs can add latency.
- Voice tone may imply clinical authority if copy is not controlled.

## Implementation Plan

1. Finalize STT provider.
2. Add backend ElevenLabs service interface and implementation.
3. Add frontend recording controls.
4. Wire voice transcript into existing `SendMessageUseCase`.
5. Add fallback UI for audio errors.

