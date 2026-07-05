# Spec: MVP Conversational Clinical Flow

## Status

`active`

## Objective

Deliver the core Ataraxia MVP flow: an anonymous user enters, gives consent,
chooses text chat or voice, starts a conversational clinical intake guided by
DSM-5/RAG material, receives orientation without diagnosis, and registers only
after receiving initial value.

Ataraxia is an orientation and support flow, not a diagnosis or prescription
product.

## Scope

Included:

- Anonymous Supabase sign-in.
- Welcome and consent entry.
- Text chat and voice mode.
- Conversational intake through messages or voice transcripts.
- DSM-5/material autorizado as RAG guidance for inquiry only.
- Continuous crisis routing if risk is detected.
- Final registration with alias and contact.

Excluded:

- Psychological test forms as the initial flow.
- Automatic diagnosis or medication recommendations.
- Real-time therapist matching.
- Payments.
- Production clinical certification.

## User Flow

1. User opens the app.
2. User reads the initial welcome and consent framing.
3. User chooses chat or voice.
4. App creates or reuses an anonymous Supabase session.
5. User shares what is happening in free conversation.
6. Backend checks risk before assistant guidance continues.
7. Backend uses RAG context to choose a short next inquiry question when useful.
8. If risk is high, crisis protocol blocks the regular flow.
9. User receives initial orientation and then final registration appears.
10. User registers alias, contact, and preferred modality.

## Functional Requirements

- The frontend must create an anonymous Supabase session before calling protected
  clinical endpoints.
- All protected clinical endpoints require `Authorization: Bearer <token>`.
- The backend must persist sessions, conversation turns, risk events, and final
  profiles.
- Voice transcripts must pass through the same risk/RAG/message pipeline as text.
- Registration appears after conversational value has been delivered.
- UI copy must be Spanish.

## Technical Contracts

Endpoints:

- `POST /api/sessions`
- `POST /api/sessions/:id/messages`
- `POST /api/sessions/:id/voice/transcribe`
- `POST /api/sessions/:id/voice/reply`
- `POST /api/sessions/:id/close`

Frontend state:

- `welcome -> mode -> chat/voice intake <-> crisis -> registration -> thankyou`

Environment:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`

## Acceptance Criteria

- [ ] A user can reach the app at `/`.
- [ ] Anonymous Supabase auth returns an access token.
- [ ] Session creation works with the anonymous token.
- [ ] Text chat sends messages and receives assistant output.
- [ ] Voice mode captures or accepts a transcript and returns text plus optional audio.
- [ ] Crisis risk blocks the regular flow for text and voice transcripts.
- [ ] Registration closes the session and upserts a profile.
- [ ] No PHQ-9/GAD-7 form or public screening endpoint remains active.
- [ ] `npm run typecheck` passes for affected apps.

## Risks

- Supabase migrations may not be applied in the target project.
- Anonymous sign-ins may be disabled in Supabase Auth settings.
- OpenAI or ElevenLabs keys may be missing or rate-limited.
- Clinical language may overclaim if prompts drift.
