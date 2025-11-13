import "./globals.css";
import React from "react";
import Link from "next/link";
import ClientProviders from "./components/ClientProviders";
import StatusBanner from "./components/StatusBanner";

export const metadata = {
  title: "REFINE AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[var(--surface)] text-[var(--text)] antialiased">
        <div className="space-bg" aria-hidden="true" />
        <div className="planet-earth" aria-hidden="true" />
        <div className="relative z-10">
          <header className="border-b border-[var(--border)]/60 bg-[var(--surface-2)]/50 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-base font-semibold tracking-tight">
                REFINE AI
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
                  className="rounded-md border border-[var(--border)]/60 px-3 py-1 hover:bg-[var(--surface-2)]/60 hover:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  프롬프트
                </Link>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-3xl px-4 py-8">
            <ClientProviders>
              <StatusBanner />
              {children}
            </ClientProviders>
          </main>

          <footer className="border-t border-[var(--border)]/60 bg-[var(--surface-2)]/40 backdrop-blur">
            <div className="mx-auto max-w-3xl px-4 py-4 text-sm text-[var(--muted)]">
              © {year} REFINE AI
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
