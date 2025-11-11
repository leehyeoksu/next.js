from fastapi import FastAPI, HTTPException
from celery.result import AsyncResult
from .celery_app import celery_app

app = FastAPI(title="MyApp Backend", version="0.1.0")


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/echo")
def echo(q: str = ""):
    return {"echo": q}


@app.post("/enqueue")
def enqueue(prompt: dict):
    text = prompt.get("prompt") if isinstance(prompt, dict) else None
    if not text or not str(text).strip():
        raise HTTPException(status_code=400, detail="prompt가 필요합니다")
    task = celery_app.send_task("backend.celery_app.process_prompt", args=[str(text)])
    return {"task_id": task.id}


@app.get("/result/{task_id}")
def result(task_id: str):
    if not task_id:
        raise HTTPException(status_code=400, detail="id가 필요합니다")
    res = AsyncResult(task_id, app=celery_app)
    data = {
        "id": task_id,
        "state": res.state,
    }
    if res.successful():
        data["result"] = res.result
    elif res.failed():
        data["error"] = str(res.result)
    return data


@app.get("/result/health-check")
def result_health():
    return {"ok": True}
