import os
from celery import Celery


BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", BROKER_URL)

celery_app = Celery(
    "myapp",
    broker=BROKER_URL,
    backend=RESULT_BACKEND,
)


@celery_app.task
def ping(x: str = "pong"):
    return x


@celery_app.task
def process_prompt(prompt: str) -> str:
  """Dummy processing task for prompt. Replace with real LLM logic."""
  prompt = (prompt or "").strip()
  if not prompt:
      return "정보 부족"
  return f"processed: {prompt}"
