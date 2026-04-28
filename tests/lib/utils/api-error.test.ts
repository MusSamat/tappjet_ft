import { describe, it, expect } from "vitest";
import { friendlyError } from "@/lib/utils/api-error";

describe("friendlyError", () => {
  it("returns reason-based message when details.reason matches", () => {
    const result = friendlyError({
      code: "CONFLICT",
      message: "conflict",
      details: { reason: "cannot_book_own_trip" },
    });
    expect(result).toBe("Вы не можете забронировать собственную поездку.");
  });

  it("falls back to code-based message when reason unknown", () => {
    const result = friendlyError({
      code: "SEATS_NOT_AVAILABLE",
      message: "no seats",
      details: { reason: "unknown_reason_xyz" },
    });
    expect(result).toBe("Мест больше нет. Попробуйте другую поездку.");
  });

  it("falls back to server message when code unknown", () => {
    const result = friendlyError({
      code: "UNKNOWN_CODE",
      message: "Something went wrong on the server",
    });
    expect(result).toBe("Something went wrong on the server");
  });

  it("handles missing details gracefully", () => {
    const result = friendlyError({
      code: "TRIP_NOT_ACTIVE",
      message: "trip not active",
    });
    expect(result).toBe("Поездка больше не активна.");
  });

  it("RATE_LIMITED returns correct message", () => {
    expect(
      friendlyError({ code: "RATE_LIMITED", message: "" }),
    ).toBe("Слишком много запросов. Подождите немного.");
  });

  it("OTP_TOO_MANY_ATTEMPTS returns correct message", () => {
    expect(
      friendlyError({ code: "OTP_TOO_MANY_ATTEMPTS", message: "" }),
    ).toBe("Слишком много попыток. Запросите новый код.");
  });

  it("invalid_credentials reason wins over code", () => {
    expect(
      friendlyError({
        code: "UNAUTHORIZED",
        message: "unauthorized",
        details: { reason: "invalid_credentials" },
      }),
    ).toBe("Неверный номер телефона или пароль.");
  });

  it("token_reuse_detected reason returns security message", () => {
    expect(
      friendlyError({
        code: "UNAUTHORIZED",
        message: "unauthorized",
        details: { reason: "token_reuse_detected" },
      }),
    ).toContain("подозрительная активность");
  });

  it("BOOKING_ALREADY_EXISTS returns correct message", () => {
    expect(
      friendlyError({ code: "BOOKING_ALREADY_EXISTS", message: "" }),
    ).toBe("У вас уже есть активное бронирование на эту поездку.");
  });

  it("FORBIDDEN returns correct message", () => {
    expect(
      friendlyError({ code: "FORBIDDEN", message: "" }),
    ).toBe("Нет прав для этого действия.");
  });

  it("NOT_FOUND returns correct message", () => {
    expect(
      friendlyError({ code: "NOT_FOUND", message: "" }),
    ).toBe("Ресурс не найден.");
  });

  it("VALIDATION_ERROR returns correct message", () => {
    expect(
      friendlyError({ code: "VALIDATION_ERROR", message: "" }),
    ).toBe("Проверьте правильность введённых данных.");
  });

  it("reason takes priority over code even when both match", () => {
    expect(
      friendlyError({
        code: "SEATS_NOT_AVAILABLE",
        message: "no seats",
        details: { reason: "cities_must_differ" },
      }),
    ).toBe("Город отправления и назначения должны отличаться.");
  });

  it("blocked reason returns account blocked message", () => {
    expect(
      friendlyError({
        code: "FORBIDDEN",
        message: "forbidden",
        details: { reason: "blocked" },
      }),
    ).toBe("Ваш аккаунт заблокирован. Обратитесь в поддержку.");
  });

  it("plate_taken reason returns plate already registered message", () => {
    expect(
      friendlyError({
        code: "CONFLICT",
        message: "",
        details: { reason: "plate_taken" },
      }),
    ).toBe("Этот госномер уже зарегистрирован в системе.");
  });
});
