"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "./Spinner";

export default function PromptForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!prompt.trim()) {
      setError("프롬프트를 입력해주세요");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || `요청 실패 (${res.status})`;
        throw new Error(msg);
      }

      const out = typeof data?.output === "string" ? data.output : "";
      if (!out) throw new Error("유효한 응답을 받지 못했습니다");
      router.push(`/result?out=${encodeURIComponent(out)}`);
    } catch (err: any) {
      setError(err?.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
        <label htmlFor="prompt" className="mb-2 block text-sm font-medium text-stone-900">
          프롬프트
        </label>
        <textarea
          id="prompt"
          aria-label="프롬프트 입력"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="요청 내용을 입력하세요"
          rows={8}
          className="w-full resize-y rounded-md border border-[var(--border)] p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
          <span>예: "CSV를 요약하는 프롬프트"</span>
          <span>{prompt.length}</span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-white shadow-sm hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            제출
          </button>
          {loading && <Spinner label="loading..." size={18} />}
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
