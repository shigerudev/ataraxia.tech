-- Ataraxia — agenda de la sesión de acompañamiento
-- Registra cómo entra el usuario tras el registro: ahora mismo o agendado.

alter table public.profiles
  add column if not exists join_mode text check (join_mode in ('now', 'scheduled')),
  add column if not exists scheduled_at timestamptz;
