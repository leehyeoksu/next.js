param(
  [string]$Destination = "C:\Users\User\OneDrive\바탕 화면\파이선 test용",
  [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = 'Stop'

$script:Src = Join-Path $PSScriptRoot "."
Write-Host "Source:" $script:Src
Write-Host "Destination:" $Destination

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
Copy-Item -Force -Path (Join-Path $script:Src "*") -Destination $Destination

Set-Location $Destination

function Use-Python {
  if (Get-Command py -ErrorAction SilentlyContinue) { return 'py -3' }
  elseif (Get-Command python -ErrorAction SilentlyContinue) { return 'python' }
  else { throw "Python not found. Install Python 3.x first." }
}

$py = Use-Python
Write-Host "Using:" $py

iex "$py -m venv .venv"

$activate = Join-Path $Destination ".venv\Scripts\Activate.ps1"
if (Test-Path $activate) { . $activate } else { throw "Failed to activate venv" }

iex "$py -m pip install -r requirements.txt"

$env:APP_BASE_URL = $BaseUrl
iex "$py -m unittest -v"

