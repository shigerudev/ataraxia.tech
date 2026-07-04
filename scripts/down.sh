#!/usr/bin/env bash
#
# Detiene el stack de Ataraxia levantado con Docker Compose.
#
# Uso:
#   ./scripts/down.sh            # detiene los contenedores
#   ./scripts/down.sh --volumes  # detiene y elimina los volúmenes asociados

set -euo pipefail

VOLUMES=false
for arg in "$@"; do
  case "$arg" in
    --volumes|-Volumes) VOLUMES=true ;;
    *) echo "Argumento desconocido: $arg" >&2; exit 1 ;;
  esac
done

# Colores
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# Ir a la raíz del repo (carpeta padre de scripts/)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no está instalado o no está en el PATH." >&2
  exit 1
fi

if [ "$VOLUMES" = true ]; then
  printf "${YELLOW}==> Deteniendo Ataraxia y eliminando volúmenes...${NC}\n"
  docker compose down --volumes
else
  printf "${CYAN}==> Deteniendo Ataraxia...${NC}\n"
  docker compose down
fi

printf "${GREEN}Listo.${NC}\n"
