import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectRuntime, getTelegramInitData } from "@/lib/detect-runtime";

// Access the Telegram WebApp mock via the existing Window.Telegram type from
// social-buttons-types.ts — we just set it directly on window in tests.

function setTelegramWebApp(initData: string | null) {
  if (initData === null) {
    // Remove entirely
    (window as Window & typeof globalThis).Telegram = undefined;
  } else {
    Object.defineProperty(window, "Telegram", {
      value: { WebApp: { initData, ready: () => {} } },
      configurable: true,
      writable: true,
    });
  }
}

beforeEach(() => {
  // Reset to no Telegram context between tests.
  setTelegramWebApp(null);
});

afterEach(() => {
  setTelegramWebApp(null);
});

describe("detectRuntime", () => {
  it("returns 'browser' when window.Telegram is undefined", () => {
    expect(detectRuntime()).toBe("browser");
  });

  it("returns 'telegram' when initData is a non-empty string", () => {
    setTelegramWebApp("query_id=AAH&user=%7B%22id%22%3A123%7D&auth_date=1700000000&hash=abc");
    expect(detectRuntime()).toBe("telegram");
  });

  it("returns 'browser' when initData is empty string", () => {
    setTelegramWebApp("");
    expect(detectRuntime()).toBe("browser");
  });

  it("returns 'browser' when WebApp property is absent", () => {
    Object.defineProperty(window, "Telegram", {
      value: { Login: {} },
      configurable: true,
      writable: true,
    });
    expect(detectRuntime()).toBe("browser");
  });
});

describe("getTelegramInitData", () => {
  it("returns null when no Telegram context", () => {
    expect(getTelegramInitData()).toBeNull();
  });

  it("returns the initData string when present", () => {
    const data = "query_id=AAH&auth_date=1700000000&hash=abc";
    setTelegramWebApp(data);
    expect(getTelegramInitData()).toBe(data);
  });

  it("returns null when initData is empty string (falsy)", () => {
    setTelegramWebApp("");
    expect(getTelegramInitData()).toBe("");
  });
});
