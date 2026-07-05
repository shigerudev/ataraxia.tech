-- Ataraxia — consistencia de la agenda
-- join_mode y scheduled_at deben contarse la misma historia: una sesión
-- agendada exige fecha; una inmediata (o sin decidir) no debe llevarla.
-- NOT VALID: no bloquea el despliegue si existieran filas previas
-- inconsistentes; validar después con:
--   alter table public.profiles validate constraint profiles_scheduling_consistency;

alter table public.profiles
  drop constraint if exists profiles_scheduling_consistency;

alter table public.profiles
  add constraint profiles_scheduling_consistency
  check (
    (join_mode = 'scheduled' and scheduled_at is not null)
    or (join_mode = 'now' and scheduled_at is null)
    or (join_mode is null and scheduled_at is null)
  ) not valid;



alter table if exists public.profiles
  add column if not exists clinical_summary jsonb;
