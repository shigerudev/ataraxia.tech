# AGENT.md — Guía de arquitectura para agentes

Este documento define la arquitectura del monorepo **Ataraxia**, una plataforma de
**acompañamiento psicológico** con un flujo clínico anónimo (cribado + conversación
CBT + protocolo de crisis) y registro final. Los agentes de IA deben leerlo antes de
modificar el código.

## Visión del producto

El usuario entra de forma **anónima** (Supabase anonymous sign-in), da su
consentimiento, elige modo (Chat; Voz en Fase 2), completa un **cribado PHQ-9/GAD-7**
con **clasificación de riesgo determinística**, conversa con un agente CBT (LLM + RAG)
con **chequeo de crisis en cada turno**, y solo al final se registra (alias + contacto).
La seguridad (protocolo de crisis) es un requisito de primera clase.

> **Aviso clínico.** El system prompt y el protocolo de crisis requieren revisión
> profesional y red-teaming antes de cualquier uso real. Ataraxia no diagnostica ni receta.

## Software Driven Development

Ataraxia trabaja con una metodología Software Driven Development: cada cambio debe
nacer de un objetivo de producto claro, bajar a una decisión técnica pequeña y
terminar en una verificación ejecutable.

Las specs viven en `specs/` y son la fuente de verdad para features nuevas. No
implementar features nuevas sin una spec aceptada o actualizada. Si una decisión
de implementación cambia el contrato, actualizar la spec en el mismo cambio.

Flujo recomendado:

1. Definir el resultado de usuario.
2. Crear o actualizar la spec correspondiente en `specs/`.
3. Implementar el menor vertical slice funcional.
4. Ejecutar typecheck/build de las apps afectadas.
5. Documentar variables de entorno, migraciones, endpoints y riesgos de seguridad.

No saltar directo a refactors amplios. Avanzar de especificación a código y de
código a verificación.

## Estructura del monorepo

```
ataraxia.tech/
├── AGENT.md                 ← Este archivo (fuente de verdad arquitectónica)
├── cursor.md                ← Checklist operativo para Cursor
├── docker-compose.yml       ← backend + frontend (Supabase es gestionado/cloud)
├── scripts/                 ← up.ps1 / down.ps1 (PowerShell)
├── supabase/                ← migraciones SQL (schema, RAG, RLS) + config
├── docs/                    ← ataraxia_prototipo_tecnico.md (diagrama, vistas, prompt)
├── specs/                   ← specs SDD: alcance, contratos y criterios de aceptación
├── apps/
│   ├── backend/             ← API REST — Clean Architecture + Supabase + OpenAI
│   └── frontend/            ← SPA React — Feature-Sliced Design (FSD)
├── .cursor/rules/           ← Reglas persistentes para agentes Cursor
└── package.json             ← npm workspaces
```

## Principios globales

1. **Separación de responsabilidades**: el backend expone contratos HTTP; el frontend consume vía `shared/api`.
2. **TypeScript estricto** en ambas apps; evitar `any`.
3. **Dominio primero**: la lógica vive en `domain/` (backend) o `entities/` + `features/` (frontend).
4. **Cambios mínimos**: extender capas existentes antes de crear abstracciones nuevas.
5. **Idioma**: código y tipos en inglés; UI y docs de producto en español.
6. **Seguridad clínica**: la clasificación de riesgo es determinística además del LLM; el protocolo de crisis es testeable y versionado en código.

---

## Backend — Clean Architecture

**Ubicación:** `apps/backend/src/`

```
infrastructure/  →  application/  →  domain/
```

| Capa | Responsabilidad | Ejemplos |
|------|-----------------|----------|
| `domain/` | Entidades, interfaces de repos/servicios, casos de uso, scoring | `Session`, `ISessionRepository`, `ILlmService`, `SendMessageUseCase`, `screening/screeningScoring` |
| `application/` | DTOs de entrada/salida | `AuthDto` |
| `infrastructure/` | Express, Supabase, OpenAI, seguridad, config, composition root | `SupabaseSessionRepository`, `OpenAiLlmService`, `RiskClassifier`, `CrisisProtocol`, `container.ts` |

### Reglas de capa

- `domain/` **no importa** de `infrastructure/` ni de `application/`.
- Los casos de uso reciben **interfaces**, no implementaciones concretas.
- El *wiring* vive solo en `infrastructure/container.ts`. Si Supabase no está configurado, `container.flow` es `null` y `/api/sessions` queda deshabilitado (el server igual arranca).
- Controladores HTTP: validan entrada → llaman caso de uso → mapean respuesta.

### Persistencia y servicios

- **Supabase** (Postgres + Auth anónima + `pgvector` + RLS). Migraciones en `supabase/migrations/`.
- El backend usa la **service_role key** (ignora RLS) y fija `user_id` explícitamente; verifica el JWT anónimo del frontend vía `SupabaseAuthGateway`.
- **OpenAI** detrás de `ILlmService` / `IEmbeddingService` (sustituibles).
- **RAG**: `IKnowledgeRepository.search` → RPC `match_documents` (HNSW, coseno). Ingesta: `npm run ingest -w @ataraxia/backend`.
- **Seguridad**: `RiskClassifier` (léxico determinístico + LLM secundario) y `CrisisProtocol` (líneas de ayuda desde `CRISIS_HOTLINES`). Los eventos se registran en `risk_events`.

### Endpoints del flujo (requieren `Authorization: Bearer <supabase access token>`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/sessions` | Crea sesión anónima |
| `POST` | `/api/sessions/:id/screening` | Envía PHQ-9/GAD-7; scoring determinístico + crisis |
| `POST` | `/api/sessions/:id/messages` | Mensaje del usuario; **respuesta SSE** (RAG + moderación de crisis por turno) |
| `POST` | `/api/sessions/:id/close` | Cierre + registro (upsert `profiles`) |

### Auth de staff (temporal)

- `InMemoryStaffAuthRepository` (hardcodeado, bcrypt, sin DB). Endpoints `POST /api/auth/login`, `GET /api/auth/me`.
- Se migrará a Supabase Auth en Fase 2. No añadir ORM/DB para staff sin solicitud explícita.

---

## Frontend — Feature-Sliced Design (FSD)

**Ubicación:** `apps/frontend/src/` — capas: `shared → entities → features → pages → app`.

**Sistema de diseño:** "Sinapsis" (Tailwind). Tokens en `apps/frontend/tailwind.config.js`, clases base en `src/app/styles/global.css`, primitivas en `shared/ui` (`Button`/`Input`/`Card`/`Chip`). Guía: `apps/frontend/DESIGN.md`. Toda UI nueva debe reutilizar estos tokens/clases (no introducir colores, tipografías ni radios fuera del sistema).

| Capa | Ejemplos |
|------|----------|
| `shared/` | `Button`, `apiClient`, `streamAssistantMessage`, `supabase/client` |
| `entities/` | `session` (tipos), `screening` (instrumentos PHQ-9/GAD-7) |
| `features/` | `session` (`useTherapyFlow`), `screening`, `chat`, `crisis`, `registration`, `voice`, `room` (salas de acompañamiento), `auth/login` (staff) |
| `pages/` | `welcome`, `mode-select`, `therapy` (controlador de flujo), `schedule` (agenda), `thank-you`, `login`/`dashboard` (staff) |
| `app/` | `App.tsx`, router, estilos base |

- El flujo es una **máquina de estados** en `features/session/model/useTherapyFlow`: `welcome → chat ⇄ crisis → registration → scheduling → {room | thankyou}`.
- Tras el registro se elige modalidad; en `scheduling` el usuario se une **ahora** (paso `room`) o **agenda** (stub → `thankyou`). La sala individual es voz 1:1 con ElevenLabs (`VITE_ELEVENLABS_AGENT_ID_INDIVIDUAL`); la grupal es una malla **WebRTC** con roster vía **Supabase Realtime** (spec 006).
- **CrisisOverlay** es bloqueante y no descartable.
- Reglas FSD: una capa solo importa de capas inferiores; prohibido importar entre slices del mismo nivel.

### Rutas

| Ruta | Página | Acceso |
|------|--------|--------|
| `/` | Flujo terapéutico (anónimo) | Público |
| `/staff/login` | Login de staff | Público |
| `/staff` | Dashboard de staff | Autenticado |

---

## Cómo extender el proyecto

Antes de extender el proyecto, revisar `specs/000-index.md` y confirmar la spec
activa. Si no existe, crearla desde `specs/template.md`.

**Nuevo caso de uso del flujo (backend):** entidad en `domain/entities` → interfaz de repo/servicio → `domain/use-cases` → implementación en `infrastructure` → registrar en `container.ts` → controller + ruta.

**Nueva vista del flujo (frontend):** tipos en `entities` → lógica en `features/{slice}` → componer en `pages` → integrar en la máquina de estados / router.

---

## Comandos de desarrollo

```bash
npm install          # raíz — instala todos los workspaces
npm run dev          # backend :3001 + frontend :5173
npm run build
npm run typecheck
npm run ingest -w @ataraxia/backend -- ./apps/backend/knowledge  # ingesta RAG
```

### Docker (backend + frontend)

```powershell
./scripts/up.ps1 -Build
./scripts/down.ps1
```

- Frontend: http://localhost:5173 · Backend: `/health` (vía proxy nginx).

### Configuración externa (la aportas tú)

- Proyecto Supabase: aplica `supabase/migrations/` y habilita Anonymous sign-ins. Copia URL + keys a los `.env`.
- `OPENAI_API_KEY`, `CRISIS_HOTLINES` del país objetivo.
- Corpus psicológico con licencia para el RAG.

### Auth de staff (prueba)

| Email | Password |
|-------|----------|
| `psicologo@ataraxia.tech` / `admin@ataraxia.tech` | `STAFF_DEFAULT_PASSWORD` (por defecto `Ataraxia2024!`) |

---

## Checklist para agentes antes de un PR

- [ ] ¿Existe una spec en `specs/` para la feature o cambio de comportamiento?
- [ ] ¿La lógica de negocio está en `domain/` (backend) o `features/`/`entities/` (frontend)?
- [ ] ¿Se respetaron las dependencias de capa?
- [ ] ¿La clasificación de riesgo sigue siendo determinística + LLM (nunca solo LLM)?
- [ ] ¿Tipos TypeScript explícitos y textos de UI en español?
- [ ] ¿Se actualizó este `AGENT.md` si cambió la arquitectura?

