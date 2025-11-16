import os
import unittest
import urllib.parse
from unittest.mock import patch, Mock

try:
    import requests  # type: ignore
except Exception as e:
    raise SystemExit("The 'requests' package is required. Install with: pip install -r backend/requirements.txt") from e

import backend.celery.tasks as tasks

BASE_URL = os.environ.get("APP_BASE_URL", "http://localhost:3000")


class TestPages(unittest.TestCase):
    def test_home_page(self):
        r = requests.get(BASE_URL + "/", timeout=10)
        self.assertEqual(r.status_code, 200)
        self.assertIn("프롬프트 변환기", r.text)

    def test_next_page(self):
        r = requests.get(BASE_URL + "/next", timeout=10)
        self.assertEqual(r.status_code, 200)
        self.assertIn("프롬프트 입력", r.text)

    def test_result_page_without_param(self):
        r = requests.get(BASE_URL + "/result", timeout=10)
        self.assertEqual(r.status_code, 200)
        self.assertTrue(("결과 없음" in r.text) or ("No result" in r.text))

    def test_result_page_with_param(self):
        content = "예시 출력입니다\n두 번째 줄"
        url = BASE_URL + "/result?out=" + urllib.parse.quote(content)
        r = requests.get(url, timeout=10)
        self.assertEqual(r.status_code, 200)
        self.assertIn("예시 출력입니다", r.text)
        self.assertIn("두 번째 줄", r.text)


class TestAPIMock(unittest.TestCase):
    def setUp(self):
        # Assumes server started with LLM_PROVIDER=mock
        pass

    def test_api_gpt_basic(self):
        payload = {"prompt": "CSV 요약 프롬프트 만들어줘"}
        r = requests.post(
            BASE_URL + "/api/gpt",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=20,
        )
        self.assertEqual(r.status_code, 200, msg=r.text)
        data = r.json()
        out = data["output"]
        for section in ["목표:", "해야 할 작업:", "제약 조건:", "출력 형식 요구:"]:
            self.assertIn(section, out)

    def test_api_gpt_empty_prompt(self):
        payload = {"prompt": ""}
        r = requests.post(
            BASE_URL + "/api/gpt",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=20,
        )
        self.assertEqual(r.status_code, 200, msg=r.text)
        data = r.json()
        out = data.get("output", "")
        self.assertIn("정보 부족", out)


class TestHealthAndBackend(unittest.TestCase):
    def test_next_api_health(self):
        r = requests.get(BASE_URL + "/api/health", timeout=10)
        self.assertEqual(r.status_code, 200)
        j = r.json()
        self.assertIn("ok", j)

    def test_backend_fastapi_health_optional(self):
        backend_base = os.environ.get("BACKEND_BASE_URL", "http://127.0.0.1:8000")
        try:
            r = requests.get(backend_base + "/health", timeout=3)
        except Exception:
            self.skipTest("Backend FastAPI not running; skipping optional check")
            return
        self.assertEqual(r.status_code, 200)
        self.assertIn("ok", r.json())

    def test_jobs_flow_optional(self):
        # Requires FastAPI + Celery + Redis running
        base = os.environ.get("APP_BASE_URL", "http://localhost:3000")
        try:
            r = requests.post(base + "/api/jobs", json={"prompt": "hello"}, timeout=5)
        except Exception:
            self.skipTest("/api/jobs not reachable; skipping")
            return
        if r.status_code != 200:
            self.skipTest(f"/api/jobs returned {r.status_code}: {r.text}")
            return
        task = r.json()
        task_id = task.get("task_id")
        self.assertTrue(task_id)
        # Poll result quickly (non-blocking expectation)
        r2 = requests.get(base + f"/api/jobs/{task_id}", timeout=5)
        self.assertIn(r2.status_code, (200, 202, 404))


if __name__ == "__main__":
    unittest.main(verbosity=2)


# ---- Unit tests (mocked network) merged from test_tasks.py ----

class TestTransformPromptUnit(unittest.TestCase):
    def test_ollama_with_mocks(self):
        with patch.dict(os.environ, {"LLM_PROVIDER": "ollama"}, clear=False):
            # Mock reachability check for /api/tags
            def fake_get(url, timeout=None):
                m = Mock()
                m.ok = True
                m.status_code = 200
                return m

            # Mock chat response
            def fake_post(url, headers=None, data=None, timeout=None):
                m = Mock()
                m.ok = True
                m.status_code = 200
                m.json.return_value = {"message": {"content": "UNIT-OUT"}}
                return m

            with patch.object(tasks.requests, "get", side_effect=fake_get), patch.object(
                tasks.requests, "post", side_effect=fake_post
            ):
                out = tasks.transform_prompt("hello")
                self.assertEqual(out, "UNIT-OUT")

    def test_openai_with_mocks(self):
        with patch.dict(os.environ, {"LLM_PROVIDER": "openai", "OPENAI_API_KEY": "dummy"}, clear=False):
            def fake_post(url, headers=None, data=None, timeout=None):
                m = Mock()
                m.ok = True
                m.status_code = 200
                m.json.return_value = {
                    "choices": [
                        {"message": {"content": "OPENAI-OUT"}},
                    ]
                }
                return m

            with patch.object(tasks.requests, "post", side_effect=fake_post):
                out = tasks.transform_prompt("hello")
                self.assertEqual(out, "OPENAI-OUT")

    def test_openai_no_key_fallback(self):
        with patch.dict(os.environ, {"LLM_PROVIDER": "openai"}, clear=False):
            # Ensure key is absent in this context
            os.environ.pop("OPENAI_API_KEY", None)
            out = tasks.transform_prompt("sample")
            self.assertIn("목표:", out)

    def test_empty_prompt_uses_fallback(self):
        out = tasks.transform_prompt("")
        self.assertIn("목표:", out)
