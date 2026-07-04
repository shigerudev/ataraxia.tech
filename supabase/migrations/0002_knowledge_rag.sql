-- Ataraxia — base de conocimiento para RAG (estudios de psicología)
-- Conocimiento GLOBAL de solo-lectura; los embeddings usan OpenAI text-embedding-3-small (1536 dims).

create extension if not exists vector;

create table if not exists public.documents (
  id bigint generated always as identity primary key,
  title text not null,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.document_sections (
  id bigint generated always as identity primary key,
  document_id bigint not null references public.documents (id) on delete cascade,
  content text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Índice HNSW para búsqueda por similitud (distancia coseno)
create index if not exists document_sections_embedding_idx
  on public.document_sections using hnsw (embedding vector_cosine_ops);

create index if not exists document_sections_document_idx
  on public.document_sections (document_id);

-- RPC de recuperación semántica.
-- Ordena por el operador de distancia crudo (<=>) para que use el índice HNSW.
create or replace function public.match_documents(
  query_embedding vector(1536),
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  id bigint,
  document_id bigint,
  content text,
  similarity float
)
language sql stable
as $$
  select
    ds.id,
    ds.document_id,
    ds.content,
    1 - (ds.embedding <=> query_embedding) as similarity
  from public.document_sections ds
  where ds.embedding is not null
    and 1 - (ds.embedding <=> query_embedding) > match_threshold
  order by ds.embedding <=> query_embedding asc
  limit match_count;
$$;
