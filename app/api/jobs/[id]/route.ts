import { NextResponse, type NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const base = process.env.CELERY_API_BASE || "http://127.0.0.1:8000";
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const resp = await fetch(`${base}/result/${encodeURIComponent(id)}`);
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
