import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toYMD, parseYMD, formatDisplay, buildGrid, dayYMD } from "@/components/ui/date-picker-utils";

describe("toYMD", () => {
  it("converts a Date to YYYY-MM-DD format", () => {
    expect(toYMD(new Date(2024, 5, 15))).toBe("2024-06-15");
  });

  it("pads single-digit month and day with zero", () => {
    expect(toYMD(new Date(2024, 0, 5))).toBe("2024-01-05");
  });

  it("new Date(2024, 0, 5) → 2024-01-05", () => {
    expect(toYMD(new Date(2024, 0, 5))).toBe("2024-01-05");
  });

  it("new Date(2024, 11, 31) → 2024-12-31", () => {
    expect(toYMD(new Date(2024, 11, 31))).toBe("2024-12-31");
  });
});

describe("parseYMD", () => {
  it("parses 2024-06-15 to correct Date fields", () => {
    const d = parseYMD("2024-06-15");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2024);
    expect(d!.getMonth()).toBe(5);
    expect(d!.getDate()).toBe(15);
  });

  it("returns null for empty string", () => {
    expect(parseYMD("")).toBeNull();
  });

  it("returns null for invalid string", () => {
    expect(parseYMD("not-a-date")).toBeNull();
  });
});

describe("formatDisplay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 1));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("same-year date shows day and short month without year", () => {
    expect(formatDisplay("2024-06-15", "ru")).toBe("15 июн");
  });

  it("different-year date shows year appended", () => {
    expect(formatDisplay("2022-06-15", "ru")).toBe("15 июн 2022");
  });

  it("returns empty string for empty string", () => {
    expect(formatDisplay("", "ru")).toBe("");
  });
});

describe("buildGrid", () => {
  it("March 2024: first 4 cells are null (Mon-Thu padding)", () => {
    const grid = buildGrid(2024, 2);
    expect(grid[0]).toBeNull();
    expect(grid[1]).toBeNull();
    expect(grid[2]).toBeNull();
    expect(grid[3]).toBeNull();
  });

  it("March 2024: cell at index 4 is 1 (first day of March)", () => {
    const grid = buildGrid(2024, 2);
    expect(grid[4]).toBe(1);
  });

  it("March 2024: last non-null cell is 31", () => {
    const grid = buildGrid(2024, 2);
    const last = [...grid].reverse().find((v) => v !== null);
    expect(last).toBe(31);
  });

  it("total length is a multiple of 7", () => {
    const grid = buildGrid(2024, 2);
    expect(grid.length % 7).toBe(0);
  });
});

describe("dayYMD", () => {
  it("dayYMD(2024, 0, 5) → 2024-01-05", () => {
    expect(dayYMD(2024, 0, 5)).toBe("2024-01-05");
  });

  it("dayYMD(2024, 11, 31) → 2024-12-31", () => {
    expect(dayYMD(2024, 11, 31)).toBe("2024-12-31");
  });
});
