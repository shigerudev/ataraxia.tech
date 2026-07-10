# Supabase — Ataraxia

Persistencia del flujo clínico: Auth anónima, Postgres, pgvector (RAG) y RLS.

## Migraciones

| Archivo | Contenido |
|---------|-----------|
| `migrations/0001_schema.sql` | `sessions`, `conversation_turns`, `risk_events`, `profiles` |
| `migrations/0002_knowledge_rag.sql` | `documents`, `document_sections`, índice HNSW y RPC `match_documents` |
| `migrations/0003_rls.sql` | Políticas RLS (backstop; el backend usa la service_role key) |
| `migrations/0004_conversational_intake.sql` | Migración desde cribado por formulario a indagación conversacional |
| `migrations/0005_session_scheduling.sql` | Campos de agenda de sesión en `profiles` |
| `migrations/0006_scheduling_consistency.sql` | Constraint de consistencia para agenda |
| `migrations/0007_conversation_turn_source.sql` | Origen por turno (`message` vs `voice_transcript`) para analítica |

## Puesta en marcha

### Opción A — Proyecto en la nube
1. Crea un proyecto en https://supabase.com.
2. En SQL Editor, ejecuta los archivos de `migrations/` en orden.
3. En Authentication → Providers, habilita **Anonymous sign-ins**.
4. Copia `Project URL`, `anon key` y `service_role key` a `apps/backend/.env` y `apps/frontend/.env`.

### Opción B — Local con CLI
```bash
supabase start
supabase db reset   # aplica las migraciones de /supabase/migrations
```

## Notas
- El backend usa la **service_role key** (solo servidor) y fija `user_id` explícitamente; RLS queda como backstop.
- La base de conocimiento (`documents` / `document_sections`) es global y de solo-lectura; se puebla con el script de ingesta (`npm run ingest -w @ataraxia/backend`) usando corpus DSM-5/material clínico autorizado.
- Embeddings: OpenAI `text-embedding-3-small` (1536 dimensiones). Si cambias de modelo, ajusta la dimensión del `vector(...)` y reindexa.
