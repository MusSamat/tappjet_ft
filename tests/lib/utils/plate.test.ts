import { describe, it, expect } from "vitest";
import { isPlateValid, normalizePlate } from "@/lib/utils/plate";

// Shared KG-plate validation — the single source of truth used by the add-car
// form (CarForm) AND the driver-verification wizard. Mirrors the Flutter
// CarValidation unit tests so both clients stay in lockstep.

describe("normalizePlate", () => {
  it("uppercases", () => expect(normalizePlate("01kg123")).toBe("01KG123"));
  it("strips spaces and symbols", () => expect(normalizePlate("01 KG-123 ABC")).toBe("01KG123ABC"));
  it("clamps to 10 chars", () => expect(normalizePlate("012345678901234")).toBe("0123456789"));
  it("empty stays empty", () => expect(normalizePlate("")).toBe(""));
  it("drops cyrillic", () => expect(normalizePlate("АВ123")).toBe("123"));
});

describe("isPlateValid", () => {
  it("4 chars valid", () => expect(isPlateValid("01KG")).toBe(true));
  it("10 chars valid", () => expect(isPlateValid("01KG123ABC")).toBe(true));
  it("3 chars invalid", () => expect(isPlateValid("01K")).toBe(false));
  it("empty invalid", () => expect(isPlateValid("")).toBe(false));
  it("symbols invalid (not normalized by isPlateValid)", () => expect(isPlateValid("01 KG")).toBe(false));
  it("normalized valid input passes", () => expect(isPlateValid(normalizePlate("01 kg 123"))).toBe(true));
  it("11 chars invalid unless normalized first", () => {
    expect(isPlateValid("01KG123ABCD")).toBe(false);
    expect(isPlateValid(normalizePlate("01KG123ABCD"))).toBe(true); // clamped to 10
  });
});
