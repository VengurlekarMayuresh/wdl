Param(
  [string]$Port = "5000"
)

$ErrorActionPreference = 'Stop'

# Paths
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend = Join-Path $root 'frontend'
$backend  = Join-Path $root 'backend'

Write-Host '==> Building frontend (production)'
npm --prefix $frontend ci
npm --prefix $frontend run build

Write-Host '==> Installing backend dependencies'
npm --prefix $backend ci

# Export environment for this session only
$env:NODE_ENV = 'production'
$env:PORT = $Port

Write-Host "==> Starting backend on port $Port"
node (Join-Path $backend 'server.js')
