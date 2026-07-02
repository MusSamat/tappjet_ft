import { describe, it, expect, vi } from "vitest";
import {
  buildBody,
  buildDeepLink,
  typeLabel,
  ACTION_TYPES,
} from "@/components/features/notifications/_utils/notification-utils";
import type { AppNotification } from "@/lib/api/notifications";
import ru from "@/messages/ru.json";

const notifMsgs = ru.notif as Record<string, string>;

// Mock translator over the real ru `notif.*` dictionary with ICU-param interpolation.
const t = vi.fn((key: string, values?: Record<string, string | number>): string => {
  let s = notifMsgs[key] ?? key;
  for (const [k, v] of Object.entries(values ?? {})) s = s.replaceAll(`{${k}}`, String(v));
  return s;
});

const notif = (type: string, payload: Record<string, unknown> = {}): AppNotification =>
  ({ type, payload }) as AppNotification;

describe("buildBody", () => {
  it("new_booking_request with passengerName+route includes name and route", () => {
    const body = buildBody(
      notif("new_booking_request", {
        passengerName: "Айгуль",
        originCity: "Бишкек",
        destinationCity: "Ош",
      }),
      t,
      "ru",
    );
    expect(body).toContain("Айгуль");
    expect(body).toContain("Бишкек");
    expect(body).toContain("Ош");
  });

  it("new_booking_request passes the seats ICU param", () => {
    const body = buildBody(
      notif("new_booking_request", {
        passengerName: "Айгуль",
        originCity: "Бишкек",
        destinationCity: "Ош",
        seatsCount: 3,
      }),
      t,
      "ru",
    );
    expect(t).toHaveBeenCalledWith("seats_part", { n: 3 });
    expect(body).toContain("3 мест");
  });

  it("new_booking_request without passengerName returns the fallback message", () => {
    const body = buildBody(notif("new_booking_request", {}), t, "ru");
    expect(body).toBe(notifMsgs.body_new_booking_request_fallback);
  });

  it("booking_accepted with driverName+route includes driver name and route", () => {
    const body = buildBody(
      notif("booking_accepted", {
        booking: {
          trip: { driver: { name: "Марат" }, originCity: "Бишкек", destinationCity: "Ош" },
        },
      }),
      t,
      "ru",
    );
    expect(body).toContain("Марат");
    expect(body).toContain("Бишкек");
    expect(body).toContain("Ош");
  });

  it("booking_rejected with from+to includes route", () => {
    const body = buildBody(
      notif("booking_rejected", {
        booking: { trip: { originCity: "Бишкек", destinationCity: "Ош" } },
      }),
      t,
      "ru",
    );
    expect(body).toContain("Бишкек");
    expect(body).toContain("Ош");
  });

  it("booking_expired returns the ru message (не успел)", () => {
    const body = buildBody(notif("booking_expired"), t, "ru");
    expect(body).toBe(notifMsgs.body_booking_expired);
    expect(body).toContain("не успел");
  });

  it("trip_reminder with from+to includes route and не забудьте", () => {
    const body = buildBody(
      notif("trip_reminder", { origin_city: "Бишкек", destination_city: "Ош" }),
      t,
      "ru",
    );
    expect(body).toContain("Бишкек");
    expect(body).toContain("Ош");
    expect(body).toContain("не забудьте");
  });

  it("new_message with preview wraps preview in quotes", () => {
    const body = buildBody(notif("new_message", { preview: "Привет!" }), t, "ru");
    expect(body).toBe("«Привет!»");
  });

  it("new_message without preview returns the fallback message", () => {
    const body = buildBody(notif("new_message", {}), t, "ru");
    expect(body).toBe(notifMsgs.body_new_message_fallback);
  });

  it("rating_received with raterName+score includes name and score", () => {
    const body = buildBody(notif("rating_received", { raterName: "Бекзод", score: 5 }), t, "ru");
    expect(body).toContain("Бекзод");
    expect(body).toContain("5");
  });

  it("verification_approved mentions верификацию", () => {
    const body = buildBody(notif("verification_approved"), t, "ru");
    expect(body).toContain("верификацию");
  });

  it("unknown type falls back to the default label", () => {
    const body = buildBody(notif("some_unknown_type"), t, "ru");
    expect(body).toBe(notifMsgs.default_label);
  });
});

describe("typeLabel", () => {
  it("resolves a known type through the translator (type_* key)", () => {
    expect(typeLabel("booking_accepted", t)).toBe(notifMsgs.type_booking_accepted);
    expect(t).toHaveBeenCalledWith("type_booking_accepted");
  });

  it("falls back to default_label for unknown types", () => {
    expect(typeLabel("some_unknown_type", t)).toBe(notifMsgs.default_label);
    expect(t).toHaveBeenCalledWith("default_label");
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
