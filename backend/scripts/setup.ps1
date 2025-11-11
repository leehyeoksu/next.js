Param(
  [string]$Python = "python"
)

$ErrorActionPreference = "Stop"

Write-Host "[setup] Creating virtual environment (.venv)" -ForegroundColor Cyan
& $Python -m venv "$PSScriptRoot/../.venv"

Write-Host "[setup] Activating virtual environment" -ForegroundColor Cyan
& "$PSScriptRoot/../.venv/Scripts/Activate.ps1"

Write-Host "[setup] Installing requirements" -ForegroundColor Cyan
pip install -r "$PSScriptRoot/../requirements.txt"

Write-Host "[setup] Done" -ForegroundColor Green

