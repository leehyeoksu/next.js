#!/usr/bin/env bash
set -euo pipefail

sudo apt update
sudo apt install -y redis-server python3-venv python3-pip

python3 -m venv "$HOME/celeryenv"
source "$HOME/celeryenv/bin/activate"

cd "/mnt/c/Users/User/myapp/backend/celery"
pip install -r requirements.txt

echo "\nDone. Commands to run in separate terminals:"
echo "1) Redis service:    sudo service redis-server start"
echo "2) Celery worker:    source ~/celeryenv/bin/activate && cd /mnt/c/Users/User/myapp/backend/celery && celery -A tasks worker -l info"
echo "3) FastAPI server:   source ~/celeryenv/bin/activate && cd /mnt/c/Users/User/myapp/backend/celery && uvicorn api:api --host 0.0.0.0 --port 8001"

