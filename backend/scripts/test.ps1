$ErrorActionPreference = "Stop"

Write-Host "[test] Activating virtual environment" -ForegroundColor Cyan
& "$PSScriptRoot/../.venv/Scripts/Activate.ps1"

if (-not $env:APP_BASE_URL) {
  $env:APP_BASE_URL = "http://localhost:3000"
}

Write-Host "[test] Running tests against $env:APP_BASE_URL" -ForegroundColor Cyan
python -m unittest -v "$PSScriptRoot/../tests/test_app.py"

