import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useApiError, useFriendlyError } from "@/lib/hooks/use-api-error";
import ru from "@/messages/ru.json";

vi.mock("@/lib/api/client", () => ({
  extractError: vi.fn((e: unknown) => e),
}));
vi.mock("next-intl", async () => {
  const messages = (await import("@/messages/ru.json")).default;
  return { useMessages: () => messages };
});

const apiErrors = ru.api_errors as Record<string, string>;
const apiErrorCodes = ru.api_error_codes as Record<string, string>;

describe("useFriendlyError", () => {
  it("resolves details.reason from the active-locale api_errors", () => {
    const { result } = renderHook(() => useFriendlyError());
    expect(
      result.current({
        code: "CONFLICT",
        message: "conflict",
        details: { reason: "cannot_book_own_trip" },
      }),
    ).toBe(apiErrors.cannot_book_own_trip);
  });

  it("falls back to api_error_codes when reason is missing", () => {
    const { result } = renderHook(() => useFriendlyError());
    expect(result.current({ code: "SEATS_NOT_AVAILABLE", message: "no seats" })).toBe(
      apiErrorCodes.SEATS_NOT_AVAILABLE,
    );
  });

  it("falls back to the server message when nothing resolves", () => {
    const { result } = renderHook(() => useFriendlyError());
    expect(result.current({ code: "UNKNOWN_CODE", message: "raw server text" })).toBe(
      "raw server text",
    );
  });
});

describe("useApiError", () => {
  it("error starts as null", () => {
    const { result } = renderHook(() => useApiError());
    expect(result.current.error).toBeNull();
  });

  it("handleError sets error to the locale-aware friendly message", () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.handleError({
        code: "CONFLICT",
        message: "conflict",
        details: { reason: "cannot_book_own_trip" },
      });
    });
    expect(result.current.error).toBe(apiErrors.cannot_book_own_trip);
  });

  it("handleError falls back to the server message for unknown errors", () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.handleError({ code: "UNKNOWN_CODE", message: "Что-то пошло не так" });
    });
    expect(result.current.error).toBe("Что-то пошло не так");
  });

  it("clearError resets error to null", () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.handleError({ code: "NOT_FOUND", message: "x" });
    });
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it("calling handleError twice updates the message", () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.handleError({ code: "NOT_FOUND", message: "" });
    });
    act(() => {
      result.current.handleError({ code: "FORBIDDEN", message: "" });
    });
    expect(result.current.error).toBe(apiErrorCodes.FORBIDDEN);
  });

  it("setError directly sets error", () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.setError("custom");
    });
    expect(result.current.error).toBe("custom");
  });
});
