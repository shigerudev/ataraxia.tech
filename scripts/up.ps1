#Requires -Version 5.1
<#
.SYNOPSIS
  Levanta el stack de Ataraxia (backend + frontend) con Docker Compose.
  Supabase es gestionado/cloud; configura las claves en apps/backend/.env.

.PARAMETER Build
  Fuerza la reconstrucción de las imágenes.

.PARAMETER Logs
  Muestra los logs en vivo tras levantar los servicios.

.EXAMPLE
  ./scripts/up.ps1
  ./scripts/up.ps1 -Build
  ./scripts/up.ps1 -Logs
#>
[CmdletBinding()]
param(
  [switch]$Build,
  [switch]$Logs
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker no está instalado o no está en el PATH."
  exit 1
}

Write-Host "==> Levantando Ataraxia (backend + frontend)..." -ForegroundColor Cyan

$composeArgs = @('compose', 'up', '-d')
if ($Build) { $composeArgs += '--build' }

docker @composeArgs

Write-Host ""
docker compose ps

Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5173/api (proxy nginx)" -ForegroundColor Green

if ($Logs) {
  Write-Host ""
  Write-Host "==> Logs (Ctrl+C para salir)..." -ForegroundColor Cyan
  docker compose logs -f
}
