# Spec: Supabase Data Model

## Status

`active`

## Objective

Define the Supabase data model for Ataraxia's anonymous conversational MVP,
including user-owned flow data, RAG knowledge storage, RLS policies, and
environment configuration.

## Scope

Included:

- Anonymous Supabase Auth users.
- Clinical sessions.
- Conversation turns from text and voice transcripts.
- Risk events.
- Final profiles with non-diagnostic clinical summaries.
- RAG documents and document sections.
- RLS as a safety backstop.

Excluded:

- Psychological test result tables.
- Billing tables.
- Therapist marketplace tables.
- Long-term medical records.

## Functional Requirements

- `sessions.user_id` references `auth.users(id)`.
- Clinical data must cascade when auth user is deleted.
- `profiles.id` maps one-to-one to `auth.users(id)`.
- `profiles.clinical_summary` stores optional non-diagnostic observations only.
- `risk_events.source` accepts `message` or `voice_transcript`.
- `document_sections.embedding` uses vector dimension `1536`.
- `match_documents` returns sections ordered by cosine similarity.

## Technical Contracts

Migrations:

- `supabase/migrations/0001_schema.sql`
- `supabase/migrations/0002_knowledge_rag.sql`
- `supabase/migrations/0003_rls.sql`
- `supabase/migrations/0004_conversational_intake.sql`

Tables:

- `sessions`
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

- [ ] Migrations run successfully in order.
- [ ] Anonymous sign-ins are enabled.
- [ ] Backend `/health` reports `flow: enabled` when Supabase and OpenAI are configured.
- [ ] Frontend can create an anonymous session.
- [ ] RLS policies prevent cross-user access with anon/authenticated keys.
- [ ] Service role operations work only from backend code.

## Risks

- The hosted Supabase project may not have the vector extension enabled.
- Using the wrong URL shape, such as `/rest/v1`, breaks client creation.
- Exposing `SUPABASE_SERVICE_ROLE_KEY` in Vite would leak privileged access.
