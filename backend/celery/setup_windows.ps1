param(
  [string]$VenvPath = ".venv-win"
)

$ErrorActionPreference = 'Stop'

function Use-Python {
  if (Get-Command py -ErrorAction SilentlyContinue) { return 'py -3' }
  elseif (Get-Command python -ErrorAction SilentlyContinue) { return 'python' }
  else { throw "Python not found. Install Python 3.x first." }
}

$py = Use-Python
Write-Host "Using:" $py

Set-Location $PSScriptRoot

if (-not (Test-Path $VenvPath)) {
  iex "$py -m venv $VenvPath"
}

$activate = Join-Path $PSScriptRoot "$VenvPath\Scripts\Activate.ps1"
. $activate

iex "$py -m pip install --upgrade pip"
iex "$py -m pip install -r requirements.txt"

Write-Host "\nDone. In VS Code, Pylance should now resolve imports."
Write-Host "Interpreter: $(Join-Path $PSScriptRoot "$VenvPath\Scripts\python.exe")"

