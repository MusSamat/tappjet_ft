import { describe, it, expect } from "vitest";
import { buildBody, buildDeepLink, ACTION_TYPES } from "@/components/features/notifications/_utils/notification-utils";
import type { AppNotification } from "@/lib/api/notifications";

type MockNotif = { type: string; payload: Record<string, unknown> };

const notif = (type: string, payload: Record<string, unknown> = {}): AppNotification =>
  ({ type, payload } as AppNotification);

describe("buildBody", () => {
  it("new_booking_request with passengerName+route includes name and route", () => {
    const body = buildBody(notif("new_booking_request", { passengerName: "Айгуль", originCity: "Бишкек", destinationCity: "Ош" }));
    expect(body).toContain("Айгуль");
    expect(body).toContain("Бишкек");
    expect(body).toContain("Ош");
  });

  it("new_booking_request without passengerName returns default message", () => {
    const body = buildBody(notif("new_booking_request", {}));
    expect(body).toBe("Новый запрос на бронирование");
  });

  it("booking_accepted with driverName+route includes driver name and route", () => {
    const body = buildBody(notif("booking_accepted", {
      booking: { trip: { driver: { name: "Марат" }, originCity: "Бишкек", destinationCity: "Ош" } },
    }));
    expect(body).toContain("Марат");
    expect(body).toContain("Бишкек");
    expect(body).toContain("Ош");
  });

  it("booking_rejected with from+to includes route", () => {
    const body = buildBody(notif("booking_rejected", {
      booking: { trip: { originCity: "Бишкек", destinationCity: "Ош" } },
    }));
    expect(body).toContain("Бишкек");
    expect(body).toContain("Ош");
  });

  it("booking_expired returns message including не успел", () => {
    const body = buildBody(notif("booking_expired"));
    expect(body).toContain("не успел");
  });

  it("trip_reminder with from+to includes route and не забудьте", () => {
    const body = buildBody(notif("trip_reminder", { origin_city: "Бишкек", destination_city: "Ош" }));
    expect(body).toContain("Бишкек");
    expect(body).toContain("Ош");
    expect(body).toContain("не забудьте");
  });

  it("new_message with preview wraps preview in quotes", () => {
    const body = buildBody(notif("new_message", { preview: "Привет!" }));
    expect(body).toContain("«Привет!»");
  });

  it("new_message without preview returns default message", () => {
    const body = buildBody(notif("new_message", {}));
    expect(body).toBe("Новое сообщение в чате");
  });

  it("rating_received with raterName+score includes name and score", () => {
    const body = buildBody(notif("rating_received", { raterName: "Бекзод", score: 5 }));
    expect(body).toContain("Бекзод");
    expect(body).toContain("5");
  });

  it("verification_approved mentions верификацию", () => {
    const body = buildBody(notif("verification_approved"));
    expect(body).toContain("верификацию");
  });

  it("unknown type returns Уведомление", () => {
    const body = buildBody(notif("some_unknown_type"));
    expect(body).toBe("Уведомление");
  });
});

describe("buildDeepLink", () => {
  it("new_booking_request → /my/bookings", () => {
    expect(buildDeepLink(notif("new_booking_request"))).toBe("/my/bookings");
  });

  it("booking_accepted with bookingId in payload.booking → /my/bookings/:id/chat", () => {
    const link = buildDeepLink(notif("booking_accepted", { booking: { id: "bk1" } }));
    expect(link).toBe("/my/bookings/bk1/chat");
  });

  it("new_message with payload.message.bookingId → /my/bookings/:id/chat", () => {
    const link = buildDeepLink(notif("new_message", { message: { bookingId: "bk2" } }));
    expect(link).toBe("/my/bookings/bk2/chat");
  });

  it("new_message without bookingId → /my/bookings", () => {
    const link = buildDeepLink(notif("new_message", {}));
    expect(link).toBe("/my/bookings");
  });

  it("rating_received → /profile", () => {
    expect(buildDeepLink(notif("rating_received"))).toBe("/profile");
  });

  it("verification_approved → /profile/driver", () => {
    expect(buildDeepLink(notif("verification_approved"))).toBe("/profile/driver");
  });

  it("request_response_received → /my/requests", () => {
    expect(buildDeepLink(notif("request_response_received"))).toBe("/my/requests");
  });

  it("unknown type → null", () => {
    expect(buildDeepLink(notif("totally_unknown"))).toBeNull();
  });
});

describe("ACTION_TYPES", () => {
  it("has new_booking_request", () => {
    expect(ACTION_TYPES.has("new_booking_request")).toBe(true);
  });

  it("has booking_accepted", () => {
    expect(ACTION_TYPES.has("booking_accepted")).toBe(true);
  });

  it("does not have rating_received", () => {
    expect(ACTION_TYPES.has("rating_received")).toBe(false);
  });
});
