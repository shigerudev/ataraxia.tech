# Spec: Crisis Protocol

## Status

`active`

## Objective

Detect high-risk signals in every user message or voice transcript and route the
user to crisis support before regular conversational guidance continues.

## Scope

Included:

- Deterministic lexical risk checks.
- Secondary LLM risk classification.
- Crisis overlay and assistant crisis message.
- Risk event persistence for `message` and `voice_transcript`.

Excluded:

- Emergency dispatch.
- Human clinician escalation workflow.
- Diagnosis or prognosis.

## Flow

1. User sends text or a voice transcript.
2. Backend runs deterministic high-risk checks.
3. Backend optionally runs LLM risk classification.
4. High risk writes `risk_events`, marks the session `crisis`, stores the crisis
   assistant message, and emits/returns crisis info.
5. Frontend displays a blocking crisis overlay.

## Requirements

- Crisis checks must run before RAG response generation.
- Voice mode must reuse the same `SendMessageUseCase` risk pipeline.
- Crisis copy must avoid methods, blame, minimization, diagnosis, and promises of
  safety.
- Hotlines come from `CRISIS_HOTLINES`.

## Acceptance Criteria

- [ ] High-risk text triggers crisis state.
- [ ] High-risk voice transcript triggers crisis state.
- [ ] Regular assistant guidance is not generated after high-risk detection.
- [ ] Crisis events record source as `message` or `voice_transcript`.
- [ ] Crisis overlay cannot be dismissed to continue the regular flow.
