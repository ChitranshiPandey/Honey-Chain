#requires -Version 5.1
# One script: installs anything missing (first run only), then starts the
# local blockchain, backend, and frontend. Just run this every time.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

function Test-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

Write-Host "== Honey Chain ==" -ForegroundColor Cyan

if (-not (Test-Command "node")) {
    Write-Host "Node.js is not installed. Get it from https://nodejs.org (18+) and re-run this script." -ForegroundColor Red
    exit 1
}
if (-not (Test-Command "python")) {
    Write-Host "Python is not installed. Get it from https://python.org (3.11+) and re-run this script." -ForegroundColor Red
    exit 1
}

# --- Setup (skipped automatically once everything is in place) ---

if (-not (Test-Path "$root\node_modules")) {
    Write-Host "`nInstalling frontend deps..." -ForegroundColor Yellow
    Push-Location $root
    npm install
    Pop-Location
}

if (-not (Test-Path "$root\contracts\node_modules")) {
    Write-Host "`nInstalling contracts deps..." -ForegroundColor Yellow
    Push-Location "$root\contracts"
    npm install
    Pop-Location
}

if (-not (Test-Path "$root\backend\venv")) {
    Write-Host "`nSetting up backend venv..." -ForegroundColor Yellow
    Push-Location "$root\backend"
    python -m venv venv
    & ".\venv\Scripts\pip.exe" install -r requirements.txt
    Pop-Location
}

if (-not (Test-Path "$root\.env.local")) {
    Copy-Item "$root\.env.local.example" "$root\.env.local"
    Write-Host "created .env.local" -ForegroundColor Yellow
}
if (-not (Test-Path "$root\backend\.env")) {
    Copy-Item "$root\backend\.env.example" "$root\backend\.env"
    Write-Host "created backend\.env" -ForegroundColor Yellow
}

Write-Host "`nSeeding backend database (skips if already seeded)..." -ForegroundColor Yellow
Push-Location "$root\backend"
& ".\venv\Scripts\python.exe" -m app.seed
Pop-Location

# --- Start everything ---

Write-Host "`nStarting Hardhat local chain..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\contracts'; npx hardhat node"

Write-Host "Waiting for chain to come up..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $body = '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
        Invoke-RestMethod -Uri "http://127.0.0.1:8545" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 1 | Out-Null
        $ready = $true
        break
    } catch { }
}
if (-not $ready) {
    Write-Host "Hardhat node did not come up in time - check its window for errors." -ForegroundColor Red
    exit 1
}

Write-Host "Deploying contract to local chain..." -ForegroundColor Cyan
Push-Location "$root\contracts"
npm run deploy:local
Pop-Location

Write-Host "Starting backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; & '.\venv\Scripts\python.exe' -m uvicorn app.main:app --reload --port 8000"

Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; npm run dev"

Write-Host "`nAll set. Three windows just opened:" -ForegroundColor Green
Write-Host "  Hardhat chain : http://127.0.0.1:8545"
Write-Host "  Backend docs  : http://localhost:8000/docs"
Write-Host "  Frontend      : http://localhost:3000"
Write-Host "`nOpen http://localhost:3000 in your browser." -ForegroundColor Green
Write-Host "Close each window (or Ctrl+C inside it) to stop that service." -ForegroundColor DarkGray
