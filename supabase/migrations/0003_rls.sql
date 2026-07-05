-- Ataraxia — Row Level Security
-- El backend usa la service_role key (que ignora RLS). Estas políticas son un
-- backstop por si el frontend consulta directamente con la anon key + JWT anónimo.

alter table public.sessions enable row level security;
alter table public.conversation_turns enable row level security;
alter table public.risk_events enable row level security;
alter table public.profiles enable row level security;

-- Cada usuario (anónimo o registrado) solo ve/gestiona sus propias sesiones.
create policy "own sessions" on public.sessions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Datos derivados: acceso condicionado a ser dueño de la sesión enlazada.
create policy "own turns" on public.conversation_turns
  for all to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "own risk events" on public.risk_events
  for all to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "own profile" on public.profiles
  for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Base de conocimiento: lectura para todos; escritura solo service_role (ingesta).
alter table public.documents enable row level security;
alter table public.document_sections enable row level security;

create policy "read documents" on public.documents
  for select to anon, authenticated
  using (true);

create policy "read document sections" on public.document_sections
  for select to anon, authenticated
  using (true);
