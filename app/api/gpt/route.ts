import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `당신은 사용자의 입력을 명확한 프롬프트로 변환하는 도우미입니다.
사용자의 의도를 파악하고, 요구사항을 정리하여 명확한 명령문으로 작성하세요.

다음 섹션으로 작성:
목표:
해야 할 작업:
제약 조건:
출력 형식 요구:

규칙:
- 과장, 감탄 등 불필요한 문장 제거
- 사용자의 말투를 존중하되 표현은 명확하게 조정
- 같은 입력에는 항상 동일한 출력이 나오도록 결정론적 처리
- 해석이 불명확할 경우 임의의 상상/창작 금지 (모를 경우 "정보 부족"으로 표시)
- 창의 정보는 명확한 표현과 구조화를 우선

기본 모델 설정 가이드:
- temperature = 0
- top_p = 1
- frequency_penalty = 0
- presence_penalty = 0`;

export async function POST(req: Request) {
  try {
    const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase();

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Content-Type가 application/json 이어야 합니다");
    }

    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt : "";

    // MOCK provider: allow empty prompt and return deterministic structured output
    if (provider === "mock") {
      const normalized = (prompt || "").trim().replace(/\s+/g, " ");
      const goalLine = normalized ? `- ${normalized}` : "- 정보 부족";
      const output = [
        "목표:",
        goalLine,
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
      ].join("\n");
      return NextResponse.json({ output });
    }

    // Non-mock providers require a prompt
    if (!prompt) {
      throw new Error("유효한 prompt 문자열이 필요합니다");
    }

    // Build messages
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ];

    let output = "";

    if (provider === "ollama") {
      const base = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
      const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2:3b-instruct";
      try {
        const resp = await fetch(`${base}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel,
            messages,
            stream: false,
            options: { temperature: 0, top_p: 1 },
          }),
        });
        if (!resp.ok) {
          let msg = `Ollama 오류 (${resp.status})`;
          try {
            const j = await resp.json();
            const em = j?.error || j?.message || "";
            if (typeof em === "string" && /not\s+found|no\s+such\s+model/i.test(em)) {
              msg = `로컬 모델이 설치되지 않았습니다. PowerShell에서:\n  ollama pull ${ollamaModel}`;
            } else if (em) {
              msg = em;
            }
          } catch {
            const t = await resp.text().catch(() => "");
            if (t) msg = t;
          }
          return NextResponse.json({ error: msg }, { status: resp.status });
        }
        const data = await resp.json();
        output = data?.message?.content?.trim?.() ?? "";
      } catch (e: any) {
        const reason = e?.message || "연결 실패";
        const hint = `Ollama 서버와 연결되지 않았습니다. 확인하세요:\n- Ollama 실행: 'ollama serve'\n- 모델 설치: 'ollama pull ${ollamaModel}'\n- URL: ${base} (환경변수 OLLAMA_BASE_URL로 변경 가능)`;
        return NextResponse.json({ error: `${reason}\n${hint}` }, { status: 502 });
      }
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
      }
      const orgId = process.env.OPENAI_ORG_ID;
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(orgId ? { "OpenAI-Organization": orgId } : {}),
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages,
          temperature: 0,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        let errMsg = `OpenAI API 오류 (${response.status})`;
        try {
          const errJson = await response.json();
          const msg = errJson?.error?.message || "";
          const code = errJson?.error?.code || "";
          if (response.status === 429 && code === "insufficient_quota") {
            errMsg = "OpenAI 크레딧/요금 한도를 초과했습니다. 결제/크레딧을 확인하세요";
          } else if (msg) {
            errMsg = msg;
          }
        } catch {
          const text = await response.text().catch(() => "");
          if (text) errMsg = text;
        }
        return NextResponse.json({ error: errMsg }, { status: response.status });
      }

      const data = await response.json();
      output = data?.choices?.[0]?.message?.content?.trim() ?? "";
    }

    return NextResponse.json({ output });
  } catch (err: any) {
    const msg = err?.message ? String(err.message) : "알 수 없는 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

