import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useApiError } from "@/lib/hooks/use-api-error";

vi.mock("@/lib/api/client", () => ({
  extractError: vi.fn((e: unknown) => e),
}));
vi.mock("@/lib/utils/api-error", () => ({
  friendlyError: vi.fn((e: unknown) => String((e as any)?.message ?? e)),
}));

describe("useApiError", () => {
  it("error starts as null", () => {
    const { result } = renderHook(() => useApiError());
    expect(result.current.error).toBeNull();
  });

  it("handleError sets error to the friendly message", () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.handleError({ message: "Что-то пошло не так" });
    });
    expect(result.current.error).toBe("Что-то пошло не так");
  });

  it("clearError resets error to null", () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.handleError({ message: "Ошибка" });
    });
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it("calling handleError twice updates the message", () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.handleError({ message: "Первая" });
    });
    act(() => {
      result.current.handleError({ message: "Вторая" });
    });
    expect(result.current.error).toBe("Вторая");
  });

  it("setError directly sets error", () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.setError("custom");
    });
    expect(result.current.error).toBe("custom");
  });
});
