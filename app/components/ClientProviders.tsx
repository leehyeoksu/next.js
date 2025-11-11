"use client";

import React from "react";
import { ToastProvider } from "./Toast";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

