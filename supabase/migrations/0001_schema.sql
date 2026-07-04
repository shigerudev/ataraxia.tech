-- Ataraxia — esquema base del flujo clínico
-- Sesiones anónimas, cribado, turnos de conversación, eventos de riesgo y perfiles.

create extension if not exists pgcrypto;

-- Sesión anónima (usuario de Supabase Auth con anonymous sign-in)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null check (channel in ('chat', 'voice')),
  status text not null default 'active' check (status in ('active', 'crisis', 'closed')),
  risk_level text check (risk_level in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
create index if not exists sessions_user_id_idx on public.sessions (user_id);

-- Resultado del cribado (PHQ-9 / GAD-7)
create table if not exists public.screening_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  instrument text not null check (instrument in ('phq9', 'gad7')),
  answers jsonb not null,
  score int not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists screening_results_session_idx on public.screening_results (session_id);

-- Turnos de la conversación terapéutica
create table if not exists public.conversation_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  emotion_tags jsonb not null default '[]'::jsonb,
  risk_signal text check (risk_signal in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);
create index if not exists conversation_turns_session_idx on public.conversation_turns (session_id, created_at);

-- Eventos críticos de riesgo (auditoría del protocolo de crisis)
create table if not exists public.risk_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  level text not null check (level in ('medium', 'high')),
  source text not null check (source in ('screening', 'message')),
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists risk_events_session_idx on public.risk_events (session_id);

-- Perfil del usuario (se completa solo en el registro final)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  alias_anonimo text not null,
  email text,
  phone text,
  diagnostico jsonb,
  modalidad text check (modalidad in ('individual', 'grupal')),
  created_at timestamptz not null default now()
);
