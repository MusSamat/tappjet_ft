import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "@/lib/hooks/use-countdown";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useCountdown", () => {
  it("starts at the given value", () => {
    const { result } = renderHook(() => useCountdown(30));
    expect(result.current.remaining).toBe(30);
  });

  it("decrements by 1 each second", () => {
    const { result } = renderHook(() => useCountdown(5));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.remaining).toBe(4);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.remaining).toBe(3);
  });

  it("stops at 0 and does not go negative", () => {
    const { result } = renderHook(() => useCountdown(2));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.remaining).toBe(0);
  });

  it("reset() restores the original seconds value", () => {
    const { result } = renderHook(() => useCountdown(10));
    act(() => { vi.advanceTimersByTime(4000); });
    expect(result.current.remaining).toBe(6);
    act(() => { result.current.reset(); });
    expect(result.current.remaining).toBe(10);
  });

  it("reset(n) sets a custom starting value", () => {
    const { result } = renderHook(() => useCountdown(10));
    act(() => { result.current.reset(60); });
    expect(result.current.remaining).toBe(60);
  });

  it("resumes counting after reset", () => {
    const { result } = renderHook(() => useCountdown(10));
    act(() => { vi.advanceTimersByTime(10000); });
    expect(result.current.remaining).toBe(0);
    act(() => { result.current.reset(); });
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.remaining).toBe(7);
  });
});
