# Ataraxia :-)

Plataforma de acompañamiento psicológico: flujo anónimo con indagación
conversacional por chat o voz, RAG clínico DSM-5/material autorizado,
protocolo de crisis continuo y registro final.

## Monorepo

| App | Stack | Puerto |
|-----|-------|--------|
| `apps/backend` | Node.js, TypeScript, Express, Clean Architecture | 3001 |
| `apps/frontend` | React, TypeScript, Vite, Feature-Sliced Design | 5173 |
| Supabase | Postgres + Auth anónima + pgvector + RLS (gestionado) | — |
| OpenAI | LLM conversacional + embeddings (RAG) | — |
| ElevenLabs | Síntesis de voz server-side | — |

## Requisitos previos

1. **Supabase**: crea un proyecto, aplica las migraciones de [`supabase/`](./supabase/README.md)
   y habilita *Anonymous sign-ins*.
2. **OpenAI**: una `OPENAI_API_KEY`.
3. **ElevenLabs**: una `ELEVENLABS_API_KEY` si quieres respuestas de voz.
4. Configura las variables de entorno (abajo).

## Variables de entorno

```bash
cp apps/backend/.env.example apps/backend/.env      # SUPABASE_*, OPENAI_API_KEY, ELEVENLABS_*, CRISIS_HOTLINES
cp apps/frontend/.env.example apps/frontend/.env     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

## Desarrollo local

```bash
npm install
npm run dev          # backend :3001 + frontend :5173
```

Sin claves de Supabase el server arranca, pero el flujo clínico (`/api/sessions`)
queda deshabilitado (ver `/health`).

## Docker

Windows (PowerShell):

```powershell
./scripts/up.ps1 -Build     # primera vez (construye imágenes)
./scripts/up.ps1            # arranques posteriores
./scripts/up.ps1 -Logs      # levanta y muestra logs
./scripts/down.ps1          # detener
./scripts/down.ps1 -Volumes # detener y borrar volúmenes
```

macOS / Linux (bash):

```bash
chmod +x scripts/*.sh       # solo la primera vez
./scripts/up.sh --build     # primera vez (construye imágenes)
./scripts/up.sh             # arranques posteriores
./scripts/up.sh --logs      # levanta y muestra logs
./scripts/down.sh           # detener
./scripts/down.sh --volumes # detener y borrar volúmenes
```

- Frontend: http://localhost:5173 (nginx sirve la SPA y proxya `/api` al backend)

## Ingesta del corpus (RAG)

Coloca corpus DSM-5/material clínico autorizado `.txt`/`.md` en
`apps/backend/knowledge/` y ejecuta:

```bash
npm run ingest -w @ataraxia/backend -- ./apps/backend/knowledge
```

## Auth de staff (temporal)

Consola de staff en `/staff/login` (se migrará a Supabase Auth en Fase 2).

| Email | Password |
|-------|----------|
| `psicologo@ataraxia.tech` / `admin@ataraxia.tech` | `STAFF_DEFAULT_PASSWORD` (por defecto `Ataraxia2024!`) |

## Documentación

- [`AGENT.md`](./AGENT.md) — arquitectura, convenciones y extensión.
- [`docs/ataraxia_prototipo_tecnico.md`](./docs/ataraxia_prototipo_tecnico.md) — diagrama de secuencia, vistas y system prompt CBT.
- [`supabase/README.md`](./supabase/README.md) — esquema y puesta en marcha.

## Estructura

```
apps/backend/src/
  domain/           # Entidades, casos de uso, interfaces (repos y servicios)
  application/      # DTOs
  infrastructure/   # HTTP, Supabase, OpenAI, seguridad (riesgo/crisis), container (DI)

apps/frontend/src/
  shared/           # UI base, API client (SSE), cliente Supabase, config
  entities/         # session
  features/         # session (flujo), chat/voice, crisis, registration, auth/login
  pages/            # welcome, mode-select, therapy, thank-you, login/dashboard (staff)
  app/              # Router, providers, estilos globales
```
