"use client";

import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
  size?: "sm" | "md";
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm";
  const styles =
    variant === "primary"
      ? "bg-[var(--button)] text-[#e5e7eb] hover:bg-[var(--button-hover)]"
      : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--accent)]";
  return <button className={`${base} ${sizes} ${styles} ${className}`} {...props} />;
}
