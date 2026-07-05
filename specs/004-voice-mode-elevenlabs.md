# Spec: Voice Mode and ElevenLabs

## Status

`active`

## Objective

Add voice interaction as an MVP modality where the user speaks, the app obtains a
text transcript, the backend routes that transcript through the same safety and
RAG flow as chat, and the backend optionally returns ElevenLabs audio.

## Scope

Included:

- Browser-side speech capture/transcript when available.
- Manual transcript fallback when browser speech recognition is unavailable.
- Reuse of message risk checks, RAG, and crisis flow.
- Server-only ElevenLabs API key usage.
- Text fallback when audio synthesis fails.

Excluded:

- Raw audio storage.
- Live phone calls.
- Voice cloning.
- Emergency voice dispatch.

## Technical Contracts

- `POST /api/sessions/:id/voice/transcribe` receives `{ transcript }` and returns
  `{ transcript }`.
- `POST /api/sessions/:id/voice/reply` receives `{ transcript }` and returns
  `{ transcript, text, crisis, audio, audioAvailable }`.
- `audio` is `null` when `ELEVENLABS_API_KEY` is missing or synthesis fails.
- ElevenLabs credentials are read only in the backend.

Environment:

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`

## Acceptance Criteria

- [ ] User can choose voice mode.
- [ ] Microphone/transcription failure degrades to manual transcript input.
- [ ] Transcript enters the same safety pipeline as chat.
- [ ] ElevenLabs audio is generated server-side when configured.
- [ ] Failure to generate audio returns readable fallback text.
