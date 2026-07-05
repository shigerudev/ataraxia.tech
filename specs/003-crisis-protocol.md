# Spec: Crisis Protocol

## Status

`active`

## Objective

Ensure every clinical interaction can detect and route potential crisis risk
before the regular AI support flow continues.

The protocol must be deterministic first and LLM-assisted second. It should
prioritize user safety, preserve auditability, and avoid making clinical claims.

## Scope

Included:

- Screening-based risk classification.
- Message-level risk classification.
- Blocking crisis overlay in the frontend.
- Risk event persistence.
- Configurable crisis hotlines.

Excluded:

- Human escalation operations center.
- Emergency dispatch.
- Legal jurisdiction automation.

## User Flow

1. User completes screening or sends a message.
2. Backend classifies risk before regular continuation.
3. If risk is medium/high, backend records a risk event.
4. If high risk is detected, regular chat flow stops.
5. Frontend shows a blocking crisis overlay with support resources.

## Functional Requirements

- Screening scoring must remain deterministic.
- Message risk classification must run before the assistant response is trusted.
- Crisis state must be persisted in `sessions.status` and `risk_events`.
- Crisis overlay must be non-dismissable as a regular UI action.
- Crisis resources come from `CRISIS_HOTLINES`.

## Non-Functional Requirements

- Do not rely only on an LLM for risk classification.
- Use plain, supportive, non-alarming Spanish UI copy.
- Avoid definitive diagnosis, blame, or minimization.
- The flow should fail closed for high-risk signals.

## Technical Contracts

Backend:

- `RiskClassifier`
- `CrisisProtocol`
- `SubmitScreeningUseCase`
- `SendMessageUseCase`

Tables:

- `sessions.status = 'crisis'`
- `sessions.risk_level`
- `risk_events`

Environment:

- `CRISIS_HOTLINES`

## Acceptance Criteria

- [ ] PHQ-9/GAD-7 high-risk answers trigger crisis state.
- [ ] High-risk message language triggers crisis state.
- [ ] A risk event is written for crisis transitions.
- [ ] Crisis UI blocks the normal chat/registration path.
- [ ] Low-risk messages continue the standard flow.
- [ ] Typecheck passes for affected apps.

## Risks

- False negatives are safety-critical.
- False positives may frustrate users but are preferable to unsafe continuation.
- Hotline configuration may be wrong for the target country.

## Implementation Plan

1. Preserve deterministic screening scoring.
2. Preserve message-level risk checks.
3. Add tests or manual fixtures for low, medium, and high risk.
4. Verify frontend crisis overlay behavior.
5. Update hotline config for the demo country.

