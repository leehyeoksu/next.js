Python unittest suite to validate the running Next.js app locally.

Prerequisites
- The app is running locally (npm run dev) at http://localhost:3000
- LLM_PROVIDER=mock (default from .env.local) so /api/gpt works without external models
- Python 3.9+ installed

Setup (Windows PowerShell)
1) Create a folder, e.g. C:\Users\User\OneDrive\바탕 화면\파이선 test용
2) Copy files from review/python-tests into that folder:
   - requirements.txt
   - test_app.py
3) In PowerShell:
   cd "C:\Users\User\OneDrive\바탕 화면\파이선 test용"
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt

Run tests
- Ensure the app is running: npm run dev
- Optional: set a different base URL
  $env:APP_BASE_URL = "http://localhost:3000"
- Execute:
  python -m unittest -v

What is tested
- GET /        → 200 and contains site title
- GET /next    → 200 and contains page heading
- GET /result  → displays "결과 없음" without param
- GET /result?out=... → shows decoded content
- POST /api/gpt (mock) → returns structured output with required sections

