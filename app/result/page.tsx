import React from "react";
import Link from "next/link";
import CopyButton from "../components/CopyButton";

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function ResultPage({ searchParams }: Props) {
  const param = searchParams?.["out"];
  const raw = Array.isArray(param) ? param[0] ?? "" : param ?? "";
  let decoded = "";
  if (raw) {
    try {
      decoded = decodeURIComponent(raw);
    } catch {
      decoded = raw; // 디코딩 실패 시 원본 표시
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">결과</h1>
        <div className="flex items-center gap-2">
          {decoded && <CopyButton text={decoded} />}
          <Link
            href="/next"
            className="inline-block rounded-md border border-amber-300 px-4 py-2 text-sm hover:bg-amber-100 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
          >
            다시 입력하러 가기
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
        <pre className="whitespace-pre-wrap text-sm leading-6 text-stone-800">{decoded ? decoded : "결과 없음"}</pre>
      </div>
    </div>
  );
}

