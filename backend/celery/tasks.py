import os
import json
import requests
from celery import Celery
from typing import List, Optional


# Redis broker/backend (DB 0 for broker, 1 for results)
app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1",
)


SYSTEM_PROMPT = (
    "당신은 사용자의 입력을 명확한 프롬프트로 변환하는 도우미입니다.\n"
    "사용자의 의도를 파악하고, 요구사항을 정리하여 명확한 명령문으로 작성하세요.\n\n"
    "다음 섹션으로 작성:\n"
    "목표:\n"
    "해야 할 작업:\n"
    "제약 조건:\n"
    "출력 형식 요구:\n\n"
    "규칙:\n"
    "- 과장, 감탄 등 불필요한 문장 제거\n"
    "- 사용자의 말투를 존중하되 표현은 명확하게 조정\n"
    "- 같은 입력에는 항상 동일한 출력이 나오도록 결정론적 처리\n"
    "- 해석이 불명확할 경우 임의의 상상/창작 금지 (모를 경우 \"정보 부족\"으로 표시)\n"
    "- 창의 정보는 명확한 표현과 구조화를 우선\n\n"
    "기본 모델 설정 가이드:\n"
    "- temperature = 0\n"
    "- top_p = 1\n"
    "- frequency_penalty = 0\n"
    "- presence_penalty = 0"
)


def _fallback_structured(prompt: str) -> str:
    text = (prompt or "").strip().replace("\n", " ")
    goal = text if text else "정보 부족"
    sections = [
        "목표:",
        f"- {goal}",
        "",
        "해야 할 작업:",
        "- 사용자의 의도 파악 및 핵심 요구 추출",
        "- 요구사항을 간결한 명령문으로 작성",
        "- 입력/출력 조건을 명시적으로 정리",
        "- 불명확한 정보는 임의 작성 금지 및 표시",
        "",
        "제약 조건:",
        "- 과장, 감탄 등 불필요한 문장 제거",
        "- 사용자의 말투 존중, 표현은 명확하게",
        "- 동일 입력 → 동일 출력(결정론적)",
        "- 해석 불명확 시 \"정보 부족\"으로 명시",
        "",
        "출력 형식 요구:",
        "- 섹션 제목은 '목표', '해야 할 작업', '제약 조건', '출력 형식 요구' 순서",
        "- 각 항목은 불릿(- )으로 나열",
        "- 과도한 장문/수식/불필요한 예시는 지양",
    ]
    return "\n".join(sections)


@app.task(name="tasks.transform_prompt")
def transform_prompt(prompt: str) -> str:
    prompt = (prompt or "").strip()
    if not prompt:
        return _fallback_structured("")

    provider = (os.environ.get("LLM_PROVIDER", "openai") or "openai").lower()

    # 1) Ollama (로컬 무료 모델)
    if provider == "ollama":
        # Celery worker and Ollama are both in WSL (or same network context in this setup)
        # We prioritize 127.0.0.1:11434 as they are likely on the same host.
        base = (os.environ.get("OLLAMA_BASE_URL") or "http://127.0.0.1:11434").strip()
        if not base.startswith("http"):
             base = f"http://{base}"
        model = (os.environ.get("OLLAMA_MODEL", "") or dev_env.get("OLLAMA_MODEL", "") or "llama3.2:3b").strip() or "llama3.2:3b"
        try:
            print(f"[celery-ollama] base={base} (env={env_base}), model={model}")
        except Exception:
            pass
        body = {
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "stream": False,
            "options": {"temperature": 0, "top_p": 1},
        }
        try:
            r = requests.post(
                f"{base}/api/chat",
                headers={"Content-Type": "application/json"},
                data=json.dumps(body),
                timeout=120,
            )
        except Exception as e:
            raise RuntimeError(f"Ollama 연결 실패: {e}")
        if not r.ok:
            try:
                j = r.json()
                em = j.get("error") if isinstance(j, dict) else None
            except Exception:
                em = r.text
            raise RuntimeError(f"Ollama 오류({r.status_code}): {em or 'unknown error'}")
        j = r.json()
        out = (j.get("message", {}) or {}).get("content", "").strip()
        return out or _fallback_structured(prompt)

    # 2) OpenAI (기본)
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"
    org_id = os.environ.get("OPENAI_ORG_ID", "").strip()

    if not api_key:
        # No API key: deterministic fallback
        return _fallback_structured(prompt)

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if org_id:
        headers["OpenAI-Organization"] = org_id

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0,
    }

    try:
        resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
    except Exception as e:
        # Surface a concise error for easier debugging in polling
        raise RuntimeError(f"OpenAI 연결 실패: {e}")

    if not resp.ok:
        try:
            err = resp.json()
            msg = err.get("error", {}).get("message") if isinstance(err, dict) else None
        except Exception:
            msg = resp.text
        raise RuntimeError(f"OpenAI 오류({resp.status_code}): {msg or 'unknown error'}")

    data = resp.json()
    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )
    return content or _fallback_structured(prompt)
