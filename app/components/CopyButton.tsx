"use client";

import React, { useState } from "react";
import Button from "./Button";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={onCopy} aria-label="결과 복사">
      {copied ? "복사됨" : "복사"}
    </Button>
  );
}
