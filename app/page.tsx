import React from 'react';
import Link from 'next/link';

function Page() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">프롬프트 변환기</h1>
        <p className="text-gray-600">명확하고 실행 가능한 프롬프트를 만들어 보세요</p>
      </div>

      <Link
        href="/next"
        className="inline-block rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--surface-2)] hover:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        프롬프트 입력
      </Link>

      <div>
        <h2 className="text-xl font-medium">Welcome to the Home Page</h2>
        <p>hello next.js</p>
      </div>
    </div>
  );
}
export default Page;

