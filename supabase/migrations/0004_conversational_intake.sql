-- Ataraxia — migra de cribado por formulario a indagación conversacional.

drop table if exists public.screening_results;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'diagnostico'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'clinical_summary'
  ) then
    alter table public.profiles rename column diagnostico to clinical_summary;
  end if;
end $$;

alter table public.risk_events
  drop constraint if exists risk_events_source_check;

alter table public.risk_events
  add constraint risk_events_source_check
  check (source in ('message', 'voice_transcript'));
