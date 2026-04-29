"use client";

import { useEffect } from "react";
import { detectRuntime } from "@/lib/detect-runtime";

export function TmaInit() {
  useEffect(() => {
    if (detectRuntime() !== "telegram") return;
    window.Telegram?.WebApp?.ready();
    window.Telegram?.WebApp?.expand();
  }, []);
  return null;
}
