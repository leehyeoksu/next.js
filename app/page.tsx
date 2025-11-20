"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Loader2, Copy, Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Page() {
  const [step, setStep] = useState<"hero" | "input" | "loading" | "result">("hero");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setStep("loading");

    try {
      // Simulate API call or use actual API
      // For now, we'll use the actual API endpoint if available, or mock it
      // Since we are fixing core functionality, let's try to hit the API
      // But for the UI demo, we might need to be careful if backend isn't ready.
      // Let's assume backend is ready or we handle error.

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Failed to process");

      const data = await res.json();
      // Polling logic would go here, but for simplicity in this step, 
      // let's assume we might need to poll or the API returns immediately (it doesn't).
      // We'll implement a simple polling mechanism here for the "SPA" feel.

      const jobId = data.job_id;
      if (!jobId) throw new Error("No job ID");

      let attempts = 0;
      const poll = async () => {
        if (attempts > 20) throw new Error("Timeout");
        attempts++;
        const statusRes = await fetch(`/api/jobs/${jobId}`);
        const statusData = await statusRes.json();

        if (statusData.status === "SUCCESS") {
          setResult(statusData.result);
          setStep("result");
        } else if (statusData.status === "FAILURE") {
          throw new Error(statusData.error || "Failed");
        } else {
          setTimeout(poll, 1000);
        }
      };
      poll();

    } catch (error) {
      console.error(error);
      setResult("오류가 발생했습니다. 다시 시도해주세요.");
      setStep("result");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden p-6">
      {/* Background Elements */}
      <div className="stars" style={{ "--duration": "3s", "--opacity": "0.7" } as any} />
      <div className="planet-earth opacity-50" />
      <div className="space-bg" />

      <div className="z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm text-blue-200"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>AI Prompt Refiner</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 text-balance">
                Refine Your <br />
                <span className="text-blue-400">Imagination</span>
              </h1>

              <p className="text-lg text-slate-400 max-w-lg mx-auto text-balance">
                당신의 아이디어를 명확하고 강력한 프롬프트로 변환하세요.
                더 나은 질문이 더 나은 결과를 만듭니다.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep("input")}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]"
              >
                시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}

          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full"
            >
              <div className="glass-panel rounded-3xl p-8 md:p-10">
                <h2 className="text-2xl font-bold mb-6 text-center">어떤 작업을 원하시나요?</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="예: '파이썬으로 뱀 게임 만들어줘' 또는 '마케팅 이메일 초안 작성해줘'"
                      className="w-full h-40 bg-black/20 border border-white/10 rounded-xl p-6 text-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setStep("hero")}
                      className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={!prompt.trim()}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20"
                    >
                      변환하기
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin relative z-10" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold">AI가 생각 중입니다...</h3>
                <p className="text-slate-400">최적의 프롬프트를 생성하고 있습니다.</p>
              </div>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className="glass-panel rounded-3xl p-8 md:p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-blue-200 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    변환된 프롬프트
                  </h2>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? "복사됨" : "복사하기"}
                  </button>
                </div>

                <div className="bg-black/30 rounded-xl p-6 border border-white/5 overflow-auto max-h-[60vh]">
                  <pre className="whitespace-pre-wrap text-slate-200 leading-relaxed font-mono text-sm">
                    {result}
                  </pre>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      setStep("input");
                      setResult("");
                    }}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
                  >
                    다시 하기
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
