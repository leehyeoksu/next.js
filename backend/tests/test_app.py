import os
import unittest
import urllib.parse

try:
    import requests  # type: ignore
except Exception as e:
    raise SystemExit("The 'requests' package is required. Install with: pip install -r backend/requirements.txt") from e


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
