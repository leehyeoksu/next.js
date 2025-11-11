#!/usr/bin/env bash
set -euo pipefail

# Run this inside WSL (Ubuntu) shell.
ROOT="/mnt/c/Users/User/myapp"
cd "$ROOT/backend"

python3 -m venv .venv-linux
source .venv-linux/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "[setup_wsl] done: venv at $(pwd)/.venv-linux"

