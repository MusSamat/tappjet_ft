export type Runtime = "telegram" | "browser";

export function detectRuntime(): Runtime {
  if (typeof window === "undefined") return "browser";
  try {
    const initData = window.Telegram?.WebApp?.initData;
    if (initData && initData.length > 0) return "telegram";
  } catch {
    // ignore
  }
  return "browser";
}

export function getTelegramInitData(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.Telegram?.WebApp?.initData ?? null;
  } catch {
    return null;
  }
}
