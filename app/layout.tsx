import "./globals.css";
import React from "react";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[var(--surface)] text-[var(--text)] antialiased">
        <header className="border-b border-[var(--border)] bg-[var(--surface-2)]/70">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-base font-semibold tracking-tight">
              프롬프트 변환기
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="rounded-md border border-transparent px-3 py-1 hover:bg-[var(--surface-2)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                홈
              </Link>
              <Link
                href="/next"
                className="rounded-md border border-[var(--border)] px-3 py-1 hover:bg-[var(--surface-2)] hover:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                프롬프트
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>

        <footer className="border-t border-[var(--border)] bg-[var(--surface-2)]/60">
          <div className="mx-auto max-w-3xl px-4 py-4 text-sm text-[var(--muted)]">
            © {year} 프롬프트 변환기
          </div>
        </footer>
      </body>
    </html>
  );
}

