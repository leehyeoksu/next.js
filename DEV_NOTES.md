# Dev Setup Notes — WSL + Docker + Redis (현재 상태)

이 파일은 재시작 후에도 같은 설정/흐름을 빠르게 복구하기 위한 요약입니다.

## 1) Docker Desktop WSL 통합
- Docker Desktop → Settings → Resources → WSL Integration
  - "Enable integration with my default WSL distro" 체크
  - (필요 시) Ubuntu 선택
- 확인: PowerShell에서 `wsl -l -v` 로 배포판 이름/버전 확인

## 2) Redis (Docker, 영구 볼륨 + 자동 재시작)
- 기존 임시 컨테이너 제거(있을 때만):
  - `docker stop redis && docker rm redis`
- 영구 볼륨 + 자동 재시작으로 실행(권장):
  - 기본: `docker run -d --name redis -p 6379:6379 -v redis-data:/data --restart unless-stopped redis:alpine`
  - AOF 영속성: `docker run -d --name redis -p 6379:6379 -v redis-data:/data --restart unless-stopped redis:alpine redis-server --appendonly yes`
- 동작 확인:
  - `docker ps` 에서 redis 컨테이너 확인
  - `redis-cli -h 127.0.0.1 -p 6379 ping` → PONG

## 3) 서비스/포트 개요
- Next.js (Windows): http://localhost:3000
- FastAPI(main) (WSL): http://127.0.0.1:8000
- Celery 브릿지 FastAPI(선택, WSL): http://wsl.localhost:8001
- Redis (Docker): 6379

## 4) 실행 방법 (오케스트레이터)
- 1회: WSL에서 백엔드 venv 생성
  - `bash /mnt/c/Users/User/myapp/backend/scripts/setup_wsl.sh`
- 매번: 루트에서 `npm run dev`
  - `dev.config.json` 기준 자동 실행: Next(Win), FastAPI(main, 8000), Celery(WSL), 브릿지(8001)

## 5) Next ↔ 백엔드 연동 옵션
- 기본: Celery 브릿지(8001) 자동 실행됨
  - `.env.local`에서 `CELERY_API_BASE=http://wsl.localhost:8001` 유지
- 대안: FastAPI(main, 8000)로 직접 연결하고 싶다면
  - `.env.local`에서 `CELERY_API_BASE` 제거 또는 `http://127.0.0.1:8000` 설정

## 6) 재시작 후 체크리스트
- Docker Desktop 실행됨 + `redis` 컨테이너 자동 시작됨 (`docker ps` 확인, 필요 시 `docker start redis`)
- WSL(Ubuntu) 준비됨 (`wsl -l -v` 확인)
- 루트에서 `npm run dev` 실행 (Next/FastAPI/Celery)
- 선택 시 브릿지(8001)도 실행

## 7) 헬스/테스트
- Next 헬스: `GET /api/health` (Ollama/OpenAI/Celery 연결 상태 요약)
- 잡 플로우: `POST /api/jobs` → task_id → `GET /api/jobs/{id}`
- 백엔드 테스트(선택): `npm run backend:test`

## 8) 환경 변수(현재 기본)
- `.env.local`
  - `LLM_PROVIDER=mock` (외부 LLM 없이 동작)
  - `CELERY_API_BASE` (8000 또는 8001 중 선택)
  - `OLLAMA_BASE_URL` (Ollama 사용 시)
- 보안: 실제 OpenAI 키가 들어있으면 교체/삭제 권장(커밋 금지)

## 9) 흔한 이슈
- Redis 데이터를 잃는 경우: 볼륨 없이 띄운 컨테이너를 재생성/재시작했을 가능성 → 위 Docker 명령으로 볼륨/자동재시작 사용
- 8001 연결 실패: 브릿지 서버(uvicorn) 미기동 가능성 → 5-B 참고
- WSL에서 `localhost:6379` 연결 문제: 보통 Docker Desktop WSL 통합이면 `127.0.0.1:6379` 접근 가능. 방화벽/포트 충돌 확인

## 10) Ollama(WSL)로 무료 로컬 모델 사용
- Celery 워커는 WSL에서 동작하며 Ollama와 통신합니다.
- dev orchestrator에 기본 설정 반영됨(`dev.config.json`):
  - `LLM_PROVIDER=ollama`
  - `OLLAMA_BASE_URL=http://127.0.0.1:11434` (WSL 내부 주소)
  - `OLLAMA_MODEL=llama3.2:3b-instruct`
- WSL(Ubuntu)에서 설치/실행/모델 준비:
  - `wsl -d Ubuntu -- bash -lc "curl -fsSL https://ollama.com/install.sh | sh"`
  - `wsl -d Ubuntu -- bash -lc "nohup ollama serve >/dev/null 2>&1 & sleep 1"`
  - `wsl -d Ubuntu -- bash -lc "ollama pull llama3.2:3b-instruct"`
- 실행 후 `npm run dev` → 프롬프트 입력 → Celery가 Ollama로 처리하여 결과 반환

## 11) 현재 상황 요약 (중간 점검)
- 증상: `/api/jobs` 큐 등록/폴링은 200 OK지만, 작업이 실패하며 결과가 비어 있음.
- 원인: Celery 태스크가 WSL 내부의 Ollama(`127.0.0.1:11434`)에 접속하는데, Ollama 서버가 설치/기동/모델 준비가 안 되어 연결 거부 발생.
- 확인 로그: `Ollama 연결 실패: HTTPConnectionPool(host='127.0.0.1', port=11434) ... Connection refused`
- 현재 상태:
  - Next.js(3000), FastAPI(8000), Bridge(8001), Celery 워커, Redis(AOF) 정상.
  - Celery 워커는 `tasks.transform_prompt`로 동작하며 LLM_PROVIDER=ollama.
  - Next → Bridge 주소는 `CELERY_API_BASE=http://localhost:8001`(Windows에서 접근).
- 조치 필요(WSL에서 Ollama 준비):
  1) 설치(없으면 설치됨)
     - `wsl -d Ubuntu -- bash -lc "command -v ollama >/dev/null 2>&1 || (curl -fsSL https://ollama.com/install.sh | sh)"`
  2) 서버 실행(백그라운드)
     - `wsl -d Ubuntu -- bash -lc "pgrep -f 'ollama serve' >/dev/null 2>&1 || (nohup ollama serve >/dev/null 2>&1 & sleep 1)"`
  3) 모델 다운로드
     - `wsl -d Ubuntu -- bash -lc "ollama pull llama3.2:3b-instruct"`
  4) 동작 확인
     - `wsl -d Ubuntu -- bash -lc "curl -s http://127.0.0.1:11434/api/tags || echo 'ollama not reachable'"`
  5) 프롬프트 다시 시도(앱은 그대로 유지): 입력 → "생성"
- 참고: 임시로 흐름만 확인하려면 Celery env의 `LLM_PROVIDER=mock`로 전환 후 `npm run dev` 재시작.

(이 노트는 `C:/Users/User/myapp/DEV_NOTES.md` 에 위치합니다.)
