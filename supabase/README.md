# Supabase — Ataraxia

Persistencia del flujo clínico: Auth anónima, Postgres, pgvector (RAG) y RLS.

## Migraciones

| Archivo | Contenido |
|---------|-----------|
| `migrations/0001_schema.sql` | `sessions`, `screening_results`, `conversation_turns`, `risk_events`, `profiles` |
| `migrations/0002_knowledge_rag.sql` | `documents`, `document_sections`, índice HNSW y RPC `match_documents` |
| `migrations/0003_rls.sql` | Políticas RLS (backstop; el backend usa la service_role key) |

## Puesta en marcha

### Opción A — Proyecto en la nube
1. Crea un proyecto en https://supabase.com.
2. En SQL Editor, ejecuta los 3 archivos de `migrations/` en orden.
3. En Authentication → Providers, habilita **Anonymous sign-ins**.
4. Copia `Project URL`, `anon key` y `service_role key` a `apps/backend/.env` y `apps/frontend/.env`.

### Opción B — Local con CLI
```bash
supabase start
supabase db reset   # aplica las migraciones de /supabase/migrations
```

## Notas
- El backend usa la **service_role key** (solo servidor) y fija `user_id` explícitamente; RLS queda como backstop.
- La base de conocimiento (`documents` / `document_sections`) es global y de solo-lectura; se puebla con el script de ingesta (`npm run ingest -w @ataraxia/backend`).
- Embeddings: OpenAI `text-embedding-3-small` (1536 dimensiones). Si cambias de modelo, ajusta la dimensión del `vector(...)` y reindexa.
