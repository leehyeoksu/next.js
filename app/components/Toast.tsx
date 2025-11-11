"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "info" | "success" | "error";
type ToastItem = { id: string; message: string; type: ToastType; autoCloseMs?: number };

type ToastContextValue = {
  show: (message: string, type?: ToastType, opts?: { autoCloseMs?: number }) => string;
  update: (id: string, message: string, type?: ToastType, opts?: { autoCloseMs?: number }) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const scheduleAutoClose = useCallback((id: string, ms?: number) => {
    if (!ms || ms <= 0) return;
    setTimeout(() => dismiss(id), ms);
  }, [dismiss]);

  const show = useCallback((message: string, type: ToastType = "info", opts?: { autoCloseMs?: number }) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, message, type, autoCloseMs: opts?.autoCloseMs };
    setToasts((prev) => [...prev, item]);
    scheduleAutoClose(id, opts?.autoCloseMs ?? (type === "info" ? 2000 : type === "success" ? 1500 : 4000));
    return id;
  }, [scheduleAutoClose]);

  const update = useCallback((id: string, message: string, type: ToastType = "info", opts?: { autoCloseMs?: number }) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, message, type } : t)));
    if (opts?.autoCloseMs !== undefined) scheduleAutoClose(id, opts.autoCloseMs);
  }, [scheduleAutoClose]);

  const value = useMemo(() => ({ show, update, dismiss }), [show, update, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-md border p-3 shadow-sm bg-white text-sm ${
              t.type === "success"
                ? "border-green-300 text-green-800"
                : t.type === "error"
                ? "border-red-300 text-red-800"
                : "border-[var(--border)] text-[var(--text)]"
            }`}
            role="status"
            aria-live="polite"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

