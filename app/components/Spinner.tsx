import React from "react";

type SpinnerProps = {
  label?: string;
  className?: string;
  size?: number; // in px
};

export default function Spinner({
  label = "loading...",
  className = "",
  size = 20,
}: SpinnerProps) {
  const dim = `${size}px`;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <div
        className="animate-spin rounded-full border-2 border-[var(--border)] border-t-transparent"
        style={{ width: dim, height: dim }}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
