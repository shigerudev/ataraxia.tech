-- Ataraxia — origen de cada turno para analítica voz/texto.

alter table public.conversation_turns
  add column if not exists source text;

update public.conversation_turns
set source = 'message'
where source is null;

alter table public.conversation_turns
  alter column source set default 'message';

alter table public.conversation_turns
  alter column source set not null;

alter table public.conversation_turns
  drop constraint if exists conversation_turns_source_check;

alter table public.conversation_turns
  add constraint conversation_turns_source_check
  check (source in ('message', 'voice_transcript'));

create index if not exists conversation_turns_source_idx
  on public.conversation_turns (source, created_at);

comment on column public.conversation_turns.source is
  'Origen del turno: message para texto/UI o assistant, voice_transcript para transcripciones reales de voz del usuario.';
