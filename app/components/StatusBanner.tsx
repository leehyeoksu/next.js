"use client";

import React, { useEffect, useState } from "react";

type Health = {
  ok: boolean;
  provider: string;
  llm: { provider: string; reachable: boolean };
  ollama?: { baseUrl: string; reachable: boolean };
  openai?: { hasKey: boolean };
  celery?: { baseUrl: string; reachable: boolean };
};

export default function StatusBanner() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        setData(j);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "health failed");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const Dot = ({ ok }: { ok: boolean }) => (
    <span
      className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`}
      aria-label={ok ? "ok" : "error"}
    />
  );

  if (error) {
    return (
      <div className="mb-4 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-2 text-xs text-[var(--text)]">
        상태 확인 실패: {error}
      </div>
    );
  }
  if (!data) return null;

  const items: Array<{ label: string; ok: boolean; hint?: string }> = [];
  items.push({ label: `LLM (${data.llm.provider})`, ok: !!data.llm.reachable });
  if (data.llm.provider === "ollama" && data.ollama) {
    items.push({ label: "Ollama", ok: !!data.ollama.reachable, hint: data.ollama.baseUrl });
  }
  if (data.llm.provider === "openai" && data.openai) {
    items.push({ label: "OpenAI Key", ok: !!data.openai.hasKey });
  }
  if (data.celery) {
    items.push({ label: "Celery", ok: !!data.celery.reachable });
  }

  return (
    <div className="mb-4 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-2 text-xs text-[var(--text)]">
      <div className="flex flex-wrap items-center gap-3">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <Dot ok={it.ok} />
            <span>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

