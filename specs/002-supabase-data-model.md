# Spec: Supabase Data Model

## Status

`active`

## Objective

Define the Supabase data model for Ataraxia's anonymous clinical MVP, including
user-owned flow data, RAG knowledge storage, RLS policies, and environment
configuration.

## Scope

Included:

- Anonymous Supabase Auth users.
- Clinical sessions.
- Screening results.
- Conversation turns.
- Risk events.
- Final profiles.
- RAG documents and document sections.
- RLS as a safety backstop.

Excluded:

- Billing tables.
- Therapist marketplace tables.
- Long-term medical records.

## User Flow

1. Frontend creates anonymous Supabase auth session.
2. Backend verifies the Supabase access token.
3. Backend writes user-owned session data with the service role key.
4. User-owned data is protected by RLS policies.
5. RAG knowledge is readable globally and written only server-side.

## Functional Requirements

- `sessions.user_id` references `auth.users(id)`.
- Clinical data must cascade when auth user is deleted.
- `profiles.id` maps one-to-one to `auth.users(id)`.
- `document_sections.embedding` uses vector dimension `1536`.
- `match_documents` returns sections ordered by cosine similarity.

## Non-Functional Requirements

- Service role key must remain server-only.
- RLS must stay enabled on clinical tables.
- Migrations must be idempotent where possible.
- Knowledge ingestion must be reproducible.

## Technical Contracts

Migrations:

- `supabase/migrations/0001_schema.sql`
- `supabase/migrations/0002_knowledge_rag.sql`
- `supabase/migrations/0003_rls.sql`

Tables:

- `sessions`
- `screening_results`
- `conversation_turns`
- `risk_events`
- `profiles`
- `documents`
- `document_sections`

RPC:

- `match_documents(query_embedding vector(1536), match_count int, match_threshold float)`

Environment:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Acceptance Criteria

- [ ] The three migrations run successfully in order.
- [ ] Anonymous sign-ins are enabled.
- [ ] Backend `/health` reports `flow: enabled` when Supabase and OpenAI are configured.
- [ ] Frontend can create an anonymous session.
- [ ] RLS policies prevent cross-user access with anon/authenticated keys.
- [ ] Service role operations work only from backend code.

## Risks

- The hosted Supabase project may not have the vector extension enabled.
- Using the wrong URL shape, such as `/rest/v1`, breaks client creation.
- Exposing `SUPABASE_SERVICE_ROLE_KEY` in Vite would leak privileged access.

## Implementation Plan

1. Apply migrations in order.
2. Enable Anonymous sign-ins in Supabase Auth.
3. Configure backend and frontend `.env` files.
4. Verify anonymous auth from frontend.
5. Verify backend persistence through the session endpoints.

