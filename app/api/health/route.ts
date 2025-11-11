import { NextResponse } from "next/server";

async function checkUrl(url: string, opts?: { timeoutMs?: number }) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 2000);
  try {
    const r = await fetch(url, { signal: controller.signal });
    const ok = r.ok;
    return { ok, status: r.status };
  } catch (e: any) {
    return { ok: false, error: e?.message || "fetch failed" };
  } finally {
    clearTimeout(t);
  }
}

export async function GET() {
  try {
    const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase();

    // Ollama
    const ollamaBase = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const ollama = await checkUrl(`${ollamaBase}/api/tags`).catch(() => ({ ok: false }));

    // OpenAI (config check only)
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

    // Celery bridge
    const celeryBase = process.env.CELERY_API_BASE || "http://wsl.localhost:8001";
    const celery = await checkUrl(`${celeryBase}/result/health-check`).catch(() => ({ ok: false }));

    const llmReachable = provider === "mock"
      ? true
      : provider === "ollama"
      ? !!ollama.ok
      : provider === "openai"
      ? hasOpenAIKey
      : false;

    const overallOk = llmReachable && (!!celery.ok || provider !== "ollama");

    return NextResponse.json({
      ok: overallOk,
      provider,
      llm: {
        provider,
        reachable: llmReachable,
      },
      ollama: { baseUrl: ollamaBase, reachable: !!ollama.ok, details: ollama },
      openai: { hasKey: hasOpenAIKey },
      celery: { baseUrl: celeryBase, reachable: !!celery.ok, details: celery },
    });
  } catch (e: any) {
    const msg = e?.message || "health error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

