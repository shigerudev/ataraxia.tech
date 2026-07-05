# Spec: Conversation Persistence and Analytics

## Status

`active`

## Objective

Persist every Ataraxia user conversation in a structured, privacy-conscious way
so the product can analyze user needs, improve clinical triage, inspect model
behavior, and retrieve the latest session context.

The platform must store the raw conversational turns plus lightweight derived
metadata such as scenario tags, risk signals, sleep/stress indicators and summary
snapshots. This enables analysis such as: "the user reports work stress and only
4 hours of sleep after a late shift" without relying on ephemeral chat state.

## Scope

Included:

- Persist all user and assistant turns for anonymous sessions.
- Preserve chronological order and channel (`chat`, later `voice` transcript).
- Attach per-turn metadata for risk, emotions, RAG scenario tags and source
  signals.
- Store session-level analytics summaries for product and clinical review.
- Support querying the latest conversation for a user/session.
- Support opt-in consent and retention metadata.
- Keep privileged analysis access on the backend/staff side only.

Excluded:

- Diagnosis generation.
- Therapist-facing full EHR/medical record features.
- Payment, billing or insurance data.
- Audio recording storage; only transcripts are in scope for voice.
- Training/fine-tuning exports.
- Public client access to service-role analytics queries.

## User Flow

1. User starts an anonymous Ataraxia session.
2. User sends a message, for example: "Estoy un poco estresado".
3. Backend persists the user turn before calling the model.
4. Backend runs deterministic risk checks and optional RAG retrieval.
5. Assistant response is streamed to the frontend.
6. Backend persists the final assistant response after the stream completes.
7. Backend stores turn metadata such as scenario tags: `stress`, `sleep`,
   `work_schedule`, `low_risk`.
8. At checkpoints or session close, backend writes a non-diagnostic summary.
9. Staff/backend tools can retrieve the latest session for analysis.

## Example Conversation to Persist

The following user scenario must be represented by the persistence layer:

- User greets Ataraxia.
- User reports being "un poco estresado".
- User reports sleeping very little.
- User explains current work allows only about 4 hours of sleep.
- User works late, exits around 2 AM, cannot fall asleep until 4 or 5 AM.
- Assistant offers sleep-routine strategies such as relaxation, dark/cool room
  and disconnecting from screens.

Expected derived tags:

- `stress`
- `sleep_insufficiency`
- `shift_work`
- `insomnia_onset`
- `work_stress`
- `psychoeducation_sleep_hygiene`
- `risk_low`

## Functional Requirements

- Every conversation turn must be written to `conversation_turns`.
- A user turn must be persisted even if the LLM call fails.
- An assistant turn must be persisted only after the final response text is
  available.
- Each turn must include:
  - `session_id`
  - `role`
  - `content`
  - `created_at`
  - optional `risk_signal`
  - optional structured metadata
- Session analytics must include:
  - primary scenario tags;
  - risk level over time;
  - current user concerns;
  - relevant contextual factors;
  - assistant interventions offered;
  - unresolved follow-up questions;
  - latest non-diagnostic summary.
- Backend must expose a staff/server-only way to fetch:
  - latest conversation;
  - conversation by `session_id`;
  - session analytics summary.
- The frontend must not receive cross-user analytics data.
- The service role key must remain backend-only.

## Non-Functional Requirements

- Privacy: avoid collecting real names, addresses, employer names or exact
  locations unless the user volunteers them and they are necessary for safety.
- Safety: crisis and abuse indicators must remain queryable for audit and
  escalation.
- Reliability: failed assistant generation must not lose the user message.
- Maintainability: metadata schema must be versioned so future classifiers can
  evolve without breaking old records.
- Performance: latest-session retrieval should use indexed fields.
- Compliance posture: treat conversation data as sensitive health-adjacent data,
  even before formal clinical compliance work.

## Technical Contracts

Endpoints:

- `POST /api/sessions/:id/messages`
  - persists user turn before generation;
  - persists assistant turn after generation;
  - attaches risk/RAG metadata where available.
- `GET /api/staff/sessions/:id/conversation`
  - staff-only;
  - returns chronological turns plus session analytics.
- `GET /api/staff/sessions/latest`
  - staff-only;
  - returns the latest session summary and turn count.

Data:

- Existing table: `sessions`
- Existing table: `conversation_turns`
- Existing table: `risk_events`
- New table: `session_analytics`

Proposed `conversation_turns` additions:

- `metadata jsonb not null default '{}'::jsonb`
- `rag_context jsonb not null default '[]'::jsonb`
- `model text`
- `token_usage jsonb`
- `completed_at timestamptz`

Proposed `session_analytics`:

- `session_id uuid primary key references public.sessions(id) on delete cascade`
- `summary text`
- `scenario_tags jsonb not null default '[]'::jsonb`
- `risk_timeline jsonb not null default '[]'::jsonb`
- `current_concerns jsonb not null default '[]'::jsonb`
- `contextual_factors jsonb not null default '[]'::jsonb`
- `interventions_offered jsonb not null default '[]'::jsonb`
- `open_questions jsonb not null default '[]'::jsonb`
- `metadata_version text not null default 'v1'`
- `updated_at timestamptz not null default now()`

Suggested metadata shape:

```json
{
  "version": "v1",
  "scenario_tags": ["stress", "sleep_insufficiency", "shift_work"],
  "signals": {
    "sleep_hours": 4,
    "work_schedule": "late_shift",
    "risk": "low"
  },
  "rag": {
    "matched_sources": ["sleep-insomnia-fatigue-assessment.md"]
  }
}
```

Environment:

- No new public environment variables.
- Staff endpoints continue using existing backend authentication.
- Supabase service role remains server-only.

Migrations:

- Add a new migration after `0004_conversational_intake.sql`, for example:
  - `supabase/migrations/0005_conversation_analytics.sql`

## Acceptance Criteria

- [ ] Sending a user message creates a `conversation_turns` row even when model
      generation fails.
- [ ] Successful assistant generation creates a second `conversation_turns` row.
- [ ] Turns are returned in chronological order by `session_id`.
- [ ] The example stress/sleep conversation can be persisted and retrieved.
- [ ] The example conversation produces tags for stress, sleep insufficiency and
      work schedule.
- [ ] A `session_analytics` record is created or updated after relevant turns.
- [ ] Staff-only latest-session endpoint returns latest session metadata without
      exposing service-role credentials.
- [ ] RLS prevents anonymous users from reading other users' conversations.
- [ ] Build/typecheck passes for affected apps.

## Risks

- Conversation logs may contain sensitive mental-health information.
- Over-collecting raw data can create privacy and security obligations.
- Derived tags can look diagnostic if labels are too clinical.
- Streaming responses can fail mid-way, creating partial assistant turns.
- Re-ingesting or reprocessing analytics without idempotency can duplicate tags.

## Implementation Plan

1. Add migration `0005_conversation_analytics.sql` for turn metadata and
   `session_analytics`.
2. Update backend domain contracts to include turn metadata and analytics writes.
3. Persist user turn before LLM generation in the message use case.
4. Persist assistant turn after stream completion.
5. Add a lightweight scenario-tagging service using deterministic rules first:
   sleep, stress, substances, grief, trauma, violence, crisis, perinatal,
   adolescent risk, chronic pain, eating/body image, mania/psychosis.
6. Store RAG matched source filenames in turn metadata.
7. Add staff-only read endpoints for conversation and latest-session summary.
8. Add tests for persistence order, failure behavior and access control.
9. Update `RAG.MD` if the analytics taxonomy changes.
