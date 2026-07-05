# Specs Index - Ataraxia

This folder is the Software Driven Development source of truth for Ataraxia.
Every new feature or behavior change should map to an active spec before code is
changed.

## Workflow

1. Pick or create a spec.
2. Clarify objective, scope, contracts, and acceptance criteria.
3. Implement the smallest vertical slice.
4. Run verification for affected apps.
5. Update the spec if implementation changes the product or technical contract.

## Status Legend

- `draft`: not ready for implementation.
- `active`: ready for implementation.
- `implemented`: implemented and verified.
- `deferred`: intentionally paused.

## Active Specs

| ID | Spec | Status | Purpose |
|----|------|--------|---------|
| 001 | [MVP Clinical Flow](./001-mvp-clinical-flow.md) | active | Anonymous flow from entry to registration. |
| 002 | [Supabase Data Model](./002-supabase-data-model.md) | active | Auth, tables, RLS, RAG, and migrations. |
| 003 | [Crisis Protocol](./003-crisis-protocol.md) | active | Deterministic risk checks and crisis UX. |
| 004 | [Voice Mode and ElevenLabs](./004-voice-mode-elevenlabs.md) | draft | Voice input/output for phase 2. |
| 005 | [Group Therapy Scheduling](./005-group-therapy-scheduling.md) | active | Group modality: join now or schedule (stub). |
| 006 | [Live Session Rooms](./006-live-session-rooms.md) | active | Individual voice room + group WebRTC mesh room. |

## Template

Use [template.md](./template.md) for new specs.

