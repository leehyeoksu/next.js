# Celery + FastAPI bridge (WSL)

This folder contains a minimal Celery worker and a FastAPI bridge to enqueue jobs from your Next.js app.

## Prereqs (WSL Ubuntu)

```bash
sudo apt update
sudo apt install -y redis-server python3-venv python3-pip
```

## Setup (first time)

```bash
python3 -m venv ~/celeryenv
source ~/celeryenv/bin/activate
cd /mnt/c/Users/User/myapp/backend/celery
pip install -r requirements.txt
```

## Run services

Start Redis (service mode):

```bash
sudo service redis-server start
```

Run Celery worker (keep this terminal open):

```bash
source ~/celeryenv/bin/activate
cd /mnt/c/Users/User/myapp/backend/celery
celery -A tasks worker -l info
```

Run FastAPI (in a new terminal):

```bash
source ~/celeryenv/bin/activate
cd /mnt/c/Users/User/myapp/backend/celery
uvicorn api:api --host 0.0.0.0 --port 8001
```

The API will be available from Windows as: `http://wsl.localhost:8001`.

## Next.js integration

Add these environment variables in `.env.local` (already added by the assistant):

```
CELERY_API_BASE=http://wsl.localhost:8001
```

Use Next API endpoints created under `app/api/jobs` to enqueue and check results.

