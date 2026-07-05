# Spec: Contextual Guided Exercises

## Status

`active`

## Objective

When Ataraxia offers coping strategies, it should provide one concrete guided
action the user can do immediately, adapted to the context they already shared.
The assistant should not stop at generic advice such as "try breathing" or
"create a routine"; it should guide a brief exercise when appropriate.

For the sleep/stress scenario, if the user works late, sleeps few hours and asks
for relaxation strategies, Ataraxia should guide a short grounding or breathing
exercise designed for the transition after work and before sleep. After the
exercise, it should ask whether the user feels better and offer continuity:
group therapy, an individual session with an Ataraxia agent, or scheduling with a
psychologist.

## Scope

Included:

- Guided breathing, grounding, body scan, micro-pause or emotion-naming
  exercises as first-step containment.
- Context adaptation using the user's words: shift work, late-night return,
  insomnia onset, stress, fatigue or rumination.
- Short, optional exercises that the user can stop at any time.
- Post-exercise check-in: whether the user feels better, the same or worse.
- Soft handoff to continuity options: group therapy, individual Ataraxia agent or
  psychologist scheduling.
- Global closing behavior: after first containment/tool, move toward a future
  session instead of continuing open-ended exploration.
- Safety-aware language for trauma, panic, psychosis, mania or crisis.
- Grounding-first support for emotionally overwhelmed users who do not want to
  explain details.

Excluded:

- Long-form meditation programs.
- Medical sleep treatment plans.
- Medication, supplements or dosage suggestions.
- Claims that an exercise will cure insomnia, anxiety or depression.
- Exercises during active crisis when immediate human help is required.

## User Flow

1. User describes stress and sleep difficulty.
2. Assistant validates the user's experience.
3. Assistant briefly frames the exercise and starts guiding it in the same
   response.
4. Assistant gives simple steps in the present tense.
5. Assistant checks how the user feels after the exercise.
6. If the user wants more support or does not feel better, assistant offers:
   group therapy, individual support with an Ataraxia agent, or scheduling an
   individual session with a psychologist.

## Functional Requirements

- If the user explicitly asks for strategies, Ataraxia must guide one exercise
  immediately in the answer, not only ask whether the user wants to try it.
- The exercise must be short enough to do in chat, ideally 60 to 120 seconds.
- The exercise must fit the context. Example: after a 2 AM shift, avoid saying
  "go to bed earlier"; focus on transition, nervous-system downshift and light
  environment.
- The assistant should frame the exercise as optional without stopping the flow:
  "Si te parece, hazlo conmigo por un minuto; si algo incomoda, paramos."
- The assistant should avoid overwhelming the user with many techniques at once.
- After the exercise, the assistant must ask a short check-in:
  "Como te sientes ahora: igual, un poco mas tranquilo o mas activado?"
- The assistant may offer continuity after the check-in:
  "Si quieres, podemos seguir con apoyo grupal, una sesion individual con un
  agente de Ataraxia o agendar con un psicologo/a."
- When the user is stable after initial support, the assistant must suggest a
  concrete future slot and explain that the next UI phases are Registro and
  Agenda.
- If risk is high, crisis protocol overrides exercises.
- If the user has expressed hopelessness or being tired of life, use sensory
  grounding before breathing exercises and ask one direct safety question after
  the practice.

## Technical Contracts

Prompt:

- `apps/backend/src/infrastructure/ai/prompts/cbtSystemPrompt.ts`

Backend safety fallback:

- `apps/backend/src/domain/use-cases/SendMessageUseCase.ts`
- If the risk classifier returns `medium` and the assistant output did not ask a
  direct safety question, the backend appends one before completing the stream.

RAG:

- `apps/backend/knowledge/interventions/guided-sleep-transition-breathing.md`
- `apps/backend/knowledge/interventions/guided-grounding-emotional-overwhelm.md`
- `apps/backend/knowledge/interventions/continuity-scheduling-after-support.md`

## Acceptance Criteria

- [ ] For the example sleep/work conversation, the assistant guides a breathing
      or grounding exercise in the same response.
- [ ] The response still validates the user's context.
- [ ] The response does not only list sleep hygiene tips.
- [ ] The response asks how the user feels after the exercise.
- [ ] The response can route to group therapy, individual Ataraxia agent or
      psychologist scheduling as follow-up options.
- [ ] The response avoids medical or diagnostic claims.
- [ ] The exercise can be completed in chat without external tools.
- [ ] If the user says they do not want to talk after expressing hopelessness,
      the assistant guides sensory grounding instead of asking for more details.
- [ ] Medium-risk assistant responses include a direct safety question even if
      the model omits it.
- [ ] After the initial support cycle, the assistant seeks closure by proposing a
      future follow-up slot and routing to Registro -> Agenda.

## Risks

- Too much guidance can feel scripted if it ignores the user's exact context.
- Breathing exercises may be uncomfortable for some trauma or panic users.
- The assistant may overuse exercises when the user needs assessment or crisis
  escalation.

## Implementation Plan

1. Update the CBT system prompt with an explicit "actionable guided exercise"
   rule.
2. Add RAG material for contextual sleep-transition breathing after late shifts.
3. Ingest the new RAG document.
4. Test with the provided conversation context.
