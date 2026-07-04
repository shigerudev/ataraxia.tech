#!/usr/bin/env bash
#
# Levanta el stack de Ataraxia (backend + frontend) con Docker Compose.
# Supabase es gestionado/cloud; configura las claves en apps/backend/.env.
#
# Uso:
#   ./scripts/up.sh          # levanta en segundo plano
#   ./scripts/up.sh --build  # reconstruye imágenes
#   ./scripts/up.sh --logs   # levanta y muestra logs en vivo
#   ./scripts/up.sh --build --logs

set -euo pipefail

BUILD=false
LOGS=false
for arg in "$@"; do
  case "$arg" in
    --build|-Build) BUILD=true ;;
    --logs|-Logs)   LOGS=true ;;
    *) echo "Argumento desconocido: $arg" >&2; exit 1 ;;
  esac
done

# Colores
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

# Ir a la raíz del repo (carpeta padre de scripts/)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no está instalado o no está en el PATH." >&2
  exit 1
fi

printf "${CYAN}==> Levantando Ataraxia (backend + frontend)...${NC}\n"

COMPOSE_ARGS=(compose up -d)
if [ "$BUILD" = true ]; then
  COMPOSE_ARGS+=(--build)
fi

docker "${COMPOSE_ARGS[@]}"

echo ""
docker compose ps

echo ""
printf "${GREEN}Frontend: http://localhost:5173${NC}\n"
printf "${GREEN}Backend:  http://localhost:5173/api (proxy nginx)${NC}\n"

if [ "$LOGS" = true ]; then
  echo ""
  printf "${CYAN}==> Logs (Ctrl+C para salir)...${NC}\n"
  docker compose logs -f
fi
