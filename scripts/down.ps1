#Requires -Version 5.1
<#
.SYNOPSIS
  Detiene el stack de Ataraxia levantado con Docker Compose.

.PARAMETER Volumes
  Elimina también los volúmenes de Docker asociados al stack.

.EXAMPLE
  ./scripts/down.ps1
  ./scripts/down.ps1 -Volumes
#>
[CmdletBinding()]
param(
  [switch]$Volumes
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker no está instalado o no está en el PATH."
  exit 1
}

if ($Volumes) {
  Write-Host "==> Deteniendo Ataraxia y eliminando volúmenes..." -ForegroundColor Yellow
  docker compose down --volumes
} else {
  Write-Host "==> Deteniendo Ataraxia..." -ForegroundColor Cyan
  docker compose down
}

Write-Host "Listo." -ForegroundColor Green
