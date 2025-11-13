import React from 'react';
import Link from 'next/link';

function Page() {
  return (
    <div className="min-h-[60vh] px-6 py-16 flex flex-col items-center justify-center text-center gap-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">REFINE AI</h1>
        <p className="mt-2 text-[var(--muted)]">명확하고 실행 가능한 프롬프트를 만들어 보세요</p>
      </div>

      <Link
        href="/next"
        className="inline-block rounded-full bg-[var(--button)] px-6 py-2 text-sm text-[#e5e7eb] shadow-sm hover:bg-[var(--button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        프롬프트 입력
      </Link>
    </div>
  );
}
export default Page;
