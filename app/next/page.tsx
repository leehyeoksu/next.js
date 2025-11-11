import React from "react";
import PromptForm from "../components/PromptForm";

export default function NextPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">프롬프트 입력</h1>
      <p className="text-stone-700">아래에 내용을 입력하고 제출하세요</p>
      <PromptForm />
    </div>
  );
}

