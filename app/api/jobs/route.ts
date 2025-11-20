import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const base = process.env.CELERY_API_BASE || "http://wsl.localhost:8001";
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt : "";
    if (!prompt.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }
    const resp = await fetch(`${base}/enqueue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      return NextResponse.json({ error: `Celery API error (${resp.status}): ${t}` }, { status: resp.status });
    }
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e: any) {
    const msg = e?.message || "connect failed";
    return NextResponse.json({ error: `Celery API connect failed: ${msg}` }, { status: 502 });
  }
}
