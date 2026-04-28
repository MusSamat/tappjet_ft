import { describe, it, expect } from "vitest";
import {
  formatDepartureLabel,
  formatIsoDate,
  formatDurationMin,
  formatShortDate,
} from "@/lib/utils/date";

const NOW = new Date("2025-06-15T10:00:00.000Z");

describe("formatDepartureLabel", () => {
  it("returns Сегодня for same day", () => {
    const iso = "2025-06-15T14:30:00.000Z";
    expect(formatDepartureLabel(iso, NOW)).toMatch(/^Сегодня,/);
  });

  it("returns Завтра for next day", () => {
    const iso = "2025-06-16T09:00:00.000Z";
    expect(formatDepartureLabel(iso, NOW)).toMatch(/^Завтра,/);
  });

  it("returns Вчера for previous day", () => {
    const iso = "2025-06-14T08:00:00.000Z";
    expect(formatDepartureLabel(iso, NOW)).toMatch(/^Вчера,/);
  });

  it("includes time in HH:MM format", () => {
    const iso = "2025-06-15T07:05:00.000Z";
    const label = formatDepartureLabel(iso, NOW);
    expect(label).toMatch(/\d{2}:\d{2}/);
  });

  it("formats distant future date with month name", () => {
    const iso = "2025-07-20T12:00:00.000Z";
    const label = formatDepartureLabel(iso, NOW);
    expect(label).toMatch(/июля|июл/);
  });
});

describe("formatIsoDate", () => {
  it("returns YYYY-MM-DD format", () => {
    expect(formatIsoDate("2025-06-15T10:00:00.000Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("formatDurationMin", () => {
  it("formats minutes only", () => {
    expect(formatDurationMin(45)).toBe("45 мин");
  });

  it("formats hours only", () => {
    expect(formatDurationMin(120)).toBe("2 ч");
  });

  it("formats hours and minutes", () => {
    expect(formatDurationMin(90)).toBe("1 ч 30 мин");
  });

  it("handles zero minutes in hours-only case", () => {
    expect(formatDurationMin(60)).toBe("1 ч");
  });
});

describe("formatShortDate", () => {
  it("returns day and short month name", () => {
    const result = formatShortDate("2025-06-15T10:00:00.000Z");
    expect(result).toMatch(/^\d+ \S+$/);
  });
});

import { formatPrice } from "@/lib/utils/date";

describe("formatPrice", () => {
  it("formats a round number with сом suffix", () => {
    expect(formatPrice(1000)).toContain("сом");
  });

  it("includes the numeric value", () => {
    expect(formatPrice(500)).toContain("500");
    expect(formatPrice(1500)).toContain("1");
    expect(formatPrice(1500)).toContain("500");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toContain("0");
    expect(formatPrice(0)).toContain("сом");
  });

  it("formats large numbers", () => {
    const result = formatPrice(10000);
    expect(result).toContain("сом");
  });
});
