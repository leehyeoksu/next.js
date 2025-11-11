from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from celery.result import AsyncResult
from tasks import app as celery_app


class EnqueueBody(BaseModel):
    prompt: str


api = FastAPI(title="Celery Bridge API", version="0.1.0")


@api.post("/enqueue")
def enqueue_job(body: EnqueueBody):
    job = celery_app.send_task("tasks.transform_prompt", args=[body.prompt])
    return {"task_id": job.id}


@api.get("/result/{task_id}")
def get_result(task_id: str):
    res = AsyncResult(task_id, app=celery_app)
    payload = {"task_id": task_id, "state": res.state}
    if res.successful():
        payload["result"] = res.get()
    elif res.failed():
        # Include a short error message
        try:
            payload["error"] = str(res.result)
        except Exception:
            payload["error"] = "unknown error"
    return payload

