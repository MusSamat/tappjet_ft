import { describe, it, expect, vi } from "vitest";
import { friendlyError, type ErrorTranslate } from "@/lib/utils/api-error";
import ru from "@/messages/ru.json";

// Translator over the real ru dictionaries — mirrors what useFriendlyError builds.
const dictionaries = {
  api_errors: ru.api_errors as Record<string, string>,
  api_error_codes: ru.api_error_codes as Record<string, string>,
};
const translate: ErrorTranslate = (namespace, key) => dictionaries[namespace][key];

describe("friendlyError — reason key resolution via translate", () => {
  it("resolves details.reason from api_errors", () => {
    const result = friendlyError(
      { code: "CONFLICT", message: "conflict", details: { reason: "cannot_book_own_trip" } },
      translate,
    );
    expect(result).toBe(dictionaries.api_errors.cannot_book_own_trip);
  });

  it("reason takes priority over code even when both are known", () => {
    const result = friendlyError(
      {
        code: "SEATS_NOT_AVAILABLE",
        message: "no seats",
        details: { reason: "cities_must_differ" },
      },
      translate,
    );
    expect(result).toBe(dictionaries.api_errors.cities_must_differ);
  });

  it("invalid_credentials reason wins over UNAUTHORIZED code", () => {
    const result = friendlyError(
      { code: "UNAUTHORIZED", message: "unauthorized", details: { reason: "invalid_credentials" } },
      translate,
    );
    expect(result).toBe(dictionaries.api_errors.invalid_credentials);
  });

  it("token_reuse_detected reason returns the security message", () => {
    const result = friendlyError(
      {
        code: "UNAUTHORIZED",
        message: "unauthorized",
        details: { reason: "token_reuse_detected" },
      },
      translate,
    );
    expect(result).toContain("подозрительная активность");
  });

  it("blocked reason returns the account-blocked message", () => {
    const result = friendlyError(
      { code: "FORBIDDEN", message: "forbidden", details: { reason: "blocked" } },
      translate,
    );
    expect(result).toBe(dictionaries.api_errors.blocked);
  });
});

describe("friendlyError — code fallback via translate", () => {
  it("falls back to api_error_codes when reason is unknown", () => {
    const result = friendlyError(
      {
        code: "SEATS_NOT_AVAILABLE",
        message: "no seats",
        details: { reason: "unknown_reason_xyz" },
      },
      translate,
    );
    expect(result).toBe(dictionaries.api_error_codes.SEATS_NOT_AVAILABLE);
  });

  it("resolves the code when details are missing", () => {
    const result = friendlyError({ code: "TRIP_NOT_ACTIVE", message: "trip not active" }, translate);
    expect(result).toBe(dictionaries.api_error_codes.TRIP_NOT_ACTIVE);
  });

  it.each([
    "RATE_LIMITED",
    "OTP_TOO_MANY_ATTEMPTS",
    "BOOKING_ALREADY_EXISTS",
    "FORBIDDEN",
    "NOT_FOUND",
    "VALIDATION_ERROR",
  ] as const)("%s resolves from api_error_codes", (code) => {
    expect(friendlyError({ code, message: "" }, translate)).toBe(
      dictionaries.api_error_codes[code],
    );
  });
});

describe("friendlyError — server-message fallback", () => {
  it("falls back to the server message when neither reason nor code resolves", () => {
    const result = friendlyError(
      { code: "UNKNOWN_CODE", message: "Something went wrong on the server" },
      translate,
    );
    expect(result).toBe("Something went wrong on the server");
  });

  it("returns the server message when no translator is provided", () => {
    const result = friendlyError({
      code: "SEATS_NOT_AVAILABLE",
      message: "raw server text",
      details: { reason: "cannot_book_own_trip" },
    });
    expect(result).toBe("raw server text");
  });

  it("does not consult the translator for the code when the reason resolved", () => {
    const spy = vi.fn<ErrorTranslate>(translate);
    friendlyError(
      { code: "CONFLICT", message: "", details: { reason: "cannot_book_own_trip" } },
      spy,
    );
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("api_errors", "cannot_book_own_trip");
  });
});
