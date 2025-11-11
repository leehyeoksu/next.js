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
        self.assertIn("결과 없음", r.text)

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


if __name__ == "__main__":
    unittest.main(verbosity=2)

