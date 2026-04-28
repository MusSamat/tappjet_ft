import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/lib/hooks/use-debounce";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebounce", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update before the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: "hello" } },
    );
    rerender({ value: "world" });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe("hello");
  });

  it("updates after the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: "hello" } },
    );
    rerender({ value: "world" });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("world");
  });

  it("resets the timer on rapid updates (takes only the last value)", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );
    rerender({ value: "b" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: "c" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: "d" });
    // Only 200ms since last rerender — not yet debounced
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe("a");
    // Now the full 300ms from the last update has elapsed
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe("d");
  });

  it("works with number values", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useDebounce(value, 200),
      { initialProps: { value: 1 } },
    );
    rerender({ value: 42 });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe(42);
  });

  it("works with delay = 0", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 0),
      { initialProps: { value: "first" } },
    );
    rerender({ value: "second" });
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current).toBe("second");
  });
});
