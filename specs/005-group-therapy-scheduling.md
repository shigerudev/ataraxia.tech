# Spec: Group Therapy Scheduling

## Status

`draft`

## Objective

Support a group modality where users can choose anonymous group support and be
scheduled into a live session when quorum is available.

## Scope

Included:

- User chooses `grupal` during final registration.
- User joins a pending group session queue.
- System tracks quorum.
- User receives confirmation when a session is ready.

Excluded:

- Full video streaming implementation.
- Payment and insurance flows.
- Therapist payroll or credentialing.

## User Flow

1. User completes initial Ataraxia flow.
2. User chooses group modality.
3. User provides contact and anonymous alias.
4. System checks existing sessions with capacity.
5. If quorum exists, user receives session details.
6. If quorum is missing, user is queued for the next group.
7. When quorum is reached, the system sends confirmation.

## Functional Requirements

- Group users must participate with an anonymous alias.
- Scheduling data must not expose real names to other participants.
- Quorum threshold must be configurable.
- Confirmation should be event-driven or trigger-driven.

## Non-Functional Requirements

- Preserve privacy between group participants.
- Avoid promising immediate availability.
- Scheduling should be auditable.

## Technical Contracts

Potential tables:

- `group_sessions`
- `group_session_participants`
- `group_session_notifications`

Potential fields:

- `alias_anonimo`
- `modality = 'grupal'`
- `status = 'pending' | 'ready' | 'confirmed' | 'cancelled'`
- `quorum_min`

Potential integrations:

- Google Calendar
- n8n webhook
- Email/SMS provider

## Acceptance Criteria

- [ ] User can select group modality at registration.
- [ ] User is queued without exposing identity to other users.
- [ ] Quorum logic identifies when a session is ready.
- [ ] Confirmation event can be triggered for a ready group.

## Risks

- Group support has higher privacy and moderation requirements.
- Low quorum may delay user value.
- Calendar or notification provider may not be ready for hackathon demo.

## Implementation Plan

1. Define exact schema and migration.
2. Add modality-specific repository methods.
3. Add queue/join logic after registration.
4. Add notification stub for hackathon demo.
5. Replace stub with provider integration later.

