# cursor.md - Cursor Working Rules for Ataraxia

Cursor should treat `AGENT.md` as the main project contract and this file as a
short execution checklist.

## Before Editing

1. Read `AGENT.md`.
2. Read `specs/000-index.md` and the active spec for the requested change.
3. Identify whether the change belongs to backend, frontend, Supabase, or docs.
4. Search the existing implementation before adding new abstractions.
5. Keep the change scoped to the requested feature or fix.

## Spec-First Rules

- Do not implement a new feature without a spec in `specs/`.
- If no spec exists, create one from `specs/template.md` first.
- If implementation changes an endpoint, table, payload, state, or safety rule,
  update the spec in the same change.
- A task is done only when its acceptance criteria are satisfied or explicitly
  marked as deferred.

## Backend Rules

- Backend code lives in `apps/backend/src`.
- Domain logic belongs in `domain/`.
- Infrastructure code belongs in `infrastructure/`.
- Controllers should validate input, call use cases, and map responses.
- Supabase access should go through existing repository/gateway patterns.
- Never use the service role key outside server-side code.

## Frontend Rules

- Frontend code lives in `apps/frontend/src`.
- Follow Feature-Sliced Design:
  `shared -> entities -> features -> pages -> app`.
- UI text should be Spanish.
- Do not import between sibling slices when a shared abstraction is needed.
- Use `shared/api` for backend calls and `shared/supabase/client.ts` for
  Supabase browser auth.

## Supabase Rules

- Schema changes require a SQL migration under `supabase/migrations/`.
- Keep RLS enabled for user-owned clinical data.
- Anonymous sign-ins must stay enabled for the MVP flow.
- The RAG tables are global read-only data for clients; writes are server-side.

## Safety Rules

- Keep crisis handling blocking and non-dismissable in the user flow.
- Do not soften or remove deterministic risk checks.
- Do not add clinical claims, prescriptions, or definitive diagnoses.
- Any AI prompt change should preserve CBT-oriented support and crisis routing.

## Commands

From the repo root:

```bash
npm install
npm run typecheck
npm run build
```

For local development:

```bash
npm run dev
```

For Docker on a machine with PowerShell and Docker:

```powershell
./scripts/up.ps1 -Build
```
