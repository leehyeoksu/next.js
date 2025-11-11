백엔드 테스트/가상환경 안내

구성
- `backend/requirements.txt`: 파이썬 의존성 목록
- `backend/tests/`: 통합/엔드포인트 테스트
- `backend/scripts/setup.ps1`: 가상환경 생성 및 의존성 설치
- `backend/scripts/test.ps1`: 가상환경 활성화 후 유닛테스트 실행

사전 준비
- 가상환경 1회 생성: PowerShell에서 `./backend/scripts/setup.ps1`
- Node 앱 실행: 루트에서 `npm run dev` (기본: http://localhost:3000)

PowerShell 사용법(Windows)
1) 설정/설치(최초 1회)
   - `./backend/scripts/setup.ps1`
2) 통합 실행(Next + FastAPI + Celery)
   - 루트에서 `npm run dev`
3) 테스트 실행(선택)
   - `./backend/scripts/test.ps1`
   - (선택) 다른 주소로 테스트: `$env:APP_BASE_URL = "http://localhost:3000"`

참고
- 가상환경 폴더(`backend/.venv`)는 커밋하지 않습니다.
- 기본 모드에서는 `LLM_PROVIDER=mock`로 외부 모델 없이 `/api/gpt`가 동작합니다.
