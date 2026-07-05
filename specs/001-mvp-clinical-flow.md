# Spec: MVP Clinical Flow

## Status

`active`

## Objective

Deliver the core Ataraxia MVP flow: an anonymous user enters, gives consent,
chooses chat or voice mode, completes screening, receives CBT-oriented support,
and registers only after receiving initial value.

The MVP must reduce onboarding friction while preserving clinical safety. It is
an orientation and support flow, not a diagnosis or prescription product.

## Scope

Included:

- Anonymous Supabase sign-in.
- Welcome and consent entry.
- Mode selection.
- PHQ-9/GAD-7 screening.
- Chat-based CBT conversation.
- Crisis routing if risk is detected.
- Final registration with alias and contact.

Excluded:

- Real-time therapist matching.
- Payments.
- Production clinical certification.
- Voice mode beyond the contracts in spec 004.

## User Flow

1. User opens the app.
2. User reads the initial welcome and consent framing.
3. User chooses chat or voice. For MVP, chat is the primary supported mode.
4. App creates or reuses an anonymous Supabase session.
5. User completes PHQ-9/GAD-7 screening.
6. Backend scores screening and classifies risk.
7. If risk is high, crisis protocol blocks the regular flow.
8. If risk is acceptable, user enters CBT-oriented chat.
9. Every user message is checked for risk before assistant guidance continues.
10. User receives initial orientation and then final registration appears.
11. User registers alias, contact, and preferred modality.

## Functional Requirements

- The frontend must create an anonymous Supabase session before calling protected
  clinical endpoints.
- All protected clinical endpoints require `Authorization: Bearer <token>`.
- The backend must persist sessions, screening results, conversation turns, risk
  events, and final profiles.
- Registration appears after the user has completed screening and chat value has
  been delivered.
- UI copy must be Spanish.

## Non-Functional Requirements

- Do not expose service role or provider secret keys in frontend code.
- The flow must remain usable when staff auth is not configured.
- The backend may start with `flow: disabled` if Supabase/OpenAI is missing, but
  production-like demos should show `flow: enabled`.
- Clinical copy must avoid definitive diagnosis and prescriptions.

## Technical Contracts

Endpoints:

- `POST /api/sessions`
- `POST /api/sessions/:id/screening`
- `POST /api/sessions/:id/messages`
- `POST /api/sessions/:id/close`

Frontend state:

- `welcome -> mode -> screening -> chat <-> crisis -> registration -> thankyou`

Environment:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Acceptance Criteria

- [ ] A user can reach the app at `/`.
- [ ] Anonymous Supabase auth returns an access token.
- [ ] Session creation works with the anonymous token.
- [ ] Screening submit persists and returns deterministic risk data.
- [ ] Chat sends messages and receives assistant output.
- [ ] Crisis risk blocks the regular flow.
- [ ] Registration closes the session and upserts a profile.
- [ ] `npm run typecheck` passes for affected apps.

## Risks

- Supabase migrations may not be applied in the target project.
- Anonymous sign-ins may be disabled in Supabase Auth settings.
- OpenAI key may be missing or rate-limited.
- Clinical language may overclaim if prompts drift.

## Implementation Plan

1. Verify environment variables.
2. Verify Supabase migrations and anonymous auth.
3. Verify existing frontend state machine against the flow.
4. Test happy path manually.
5. Test crisis path manually.
6. Update docs and specs for any contract drift.

