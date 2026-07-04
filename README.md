# Ataraxia :-)

Plataforma de sesiones de psicología (terapia individual y grupal).

## Monorepo

| App | Stack | Puerto |
|-----|-------|--------|
| `apps/backend` | Node.js, TypeScript, Express, Clean Architecture, MongoDB | 3001 |
| `apps/frontend` | React, TypeScript, Vite, Feature-Sliced Design | 5173 |
| MongoDB | Base de datos (Docker) | 27017 |

## Inicio rápido con Docker (recomendado)

Levanta MongoDB, backend y frontend en un solo comando:

```powershell
./scripts/up.ps1 -Build     # primera vez (construye imágenes)
./scripts/up.ps1            # arranques posteriores
./scripts/down.ps1          # detener (conserva datos)
./scripts/down.ps1 -Volumes # detener y borrar la base de datos
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001/health
- MongoDB: `mongodb://localhost:27017`

## Desarrollo local (sin Docker)

Requiere una instancia de MongoDB accesible (ajusta `apps/backend/.env`).

```bash
npm install
npm run dev
```

## Variables de entorno

Copia los ejemplos y ajústalos según tu entorno:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

## Credenciales de ejemplo (seed)

Se crean automáticamente al iniciar si la base está vacía. La contraseña es el valor de `SEED_DEFAULT_PASSWORD` (por defecto `Ataraxia2024!`) y se almacena encriptada con bcrypt.

| Email | Rol |
|-------|-----|
| `psicologo@ataraxia.tech` | Psicólogo/a |
| `paciente@ataraxia.tech` | Paciente |
| `admin@ataraxia.tech` | Administrador |

## Documentación para agentes

Ver [`AGENT.md`](./AGENT.md) para arquitectura, convenciones y reglas de extensión.

## Estructura

```
apps/backend/src/
  domain/           # Entidades, casos de uso, interfaces (repos y servicios)
  application/      # DTOs
  infrastructure/   # HTTP, MongoDB, JWT, bcrypt, container (DI)

apps/frontend/src/
  shared/           # UI base, API client, config
  entities/         # Modelos de dominio UI
  features/         # Login y futuras acciones
  pages/            # Composición por ruta
  app/              # Router, providers, estilos globales
```
