"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "./Spinner";
import { useToast } from "./Toast";

export default function PromptForm() {
  const router = useRouter();
  const toast = useToast();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [queueing, setQueueing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    // 단일 경로: Celery 큐로 전송 후 폴링
    e.preventDefault();
    await handleQueue({ preventDefault() {} } as any);
  };

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const handleQueue = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    if (!prompt.trim()) {
      setError("프롬프트를 입력해 주세요.");
      return;
    }
    setQueueing(true);
    try {
      const toastId = toast.show("큐 등록 중...", "info");
      const enq = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const enqData = await enq.json().catch(() => ({}));
      if (!enq.ok) {
        const msg = enqData?.error || `큐 등록 실패 (${enq.status})`;
        toast.update(toastId, msg, "error", { autoCloseMs: 4000 });
        throw new Error(msg);
      }
      const taskId = enqData?.task_id as string;
      if (!taskId) {
        toast.update(toastId, "task_id를 받지 못했습니다.", "error", { autoCloseMs: 4000 });
        throw new Error("task_id를 받지 못했습니다.");
      }

      const deadline = Date.now() + 30000; // 30s
      toast.update(toastId, "처리 중...", "info");
      while (Date.now() < deadline) {
        const r = await fetch(`/api/jobs/${encodeURIComponent(taskId)}`);
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          const msg = data?.error || `결과 조회 실패 (${r.status})`;
          toast.update(toastId, msg, "error", { autoCloseMs: 4000 });
          throw new Error(msg);
        }
        const state = data?.state as string;
        if (state === "SUCCESS") {
          const resultOut = typeof data?.result === "string" ? data.result : "";
          if (!resultOut) {
            toast.update(toastId, "결과가 비어 있습니다.", "error", { autoCloseMs: 4000 });
            throw new Error("결과가 비어 있습니다.");
          }
          toast.update(toastId, "완료되었습니다.", "success", { autoCloseMs: 1500 });
          router.push(`/result?out=${encodeURIComponent(resultOut)}`);
          return;
        }
        if (state === "FAILURE" || state === "REVOKED") {
          const msg = `작업 실패: ${state}`;
          toast.update(toastId, msg, "error", { autoCloseMs: 4000 });
          throw new Error(msg);
        }
        await sleep(1000);
      }
      toast.update("", "", "info");
      const timeoutMsg = "시간 내에 결과를 받지 못했습니다.";
      toast.show(timeoutMsg, "error", { autoCloseMs: 4000 });
      throw new Error(timeoutMsg);
    } catch (err: any) {
      setError(err?.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setQueueing(false);
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
            disabled={loading || queueing || !prompt.trim()}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-white shadow-sm hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Celery 큐로 보내고 결과 대기"
          >
            생성
          </button>
          {(loading || queueing) && (
            <Spinner label={loading ? "loading..." : "queueing..."} size={18} />
          )}
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
