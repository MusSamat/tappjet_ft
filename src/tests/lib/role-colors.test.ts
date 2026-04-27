import { describe, it, expect } from "vitest";
import { ROLE_COLORS } from "@/lib/role-colors";

describe("ROLE_COLORS", () => {
  it("passenger has navActive: text-teal-600", () => {
    expect(ROLE_COLORS.passenger.navActive).toBe("text-teal-600");
  });

  it("driver has navActive: text-sky-600", () => {
    expect(ROLE_COLORS.driver.navActive).toBe("text-sky-600");
  });

  it("passenger and driver produce different avatarBgOn values", () => {
    expect(ROLE_COLORS.passenger.avatarBgOn).not.toBe(ROLE_COLORS.driver.avatarBgOn);
  });

  it("all ROLE_COLORS keys have the same property names", () => {
    const expectedProps = [
      "navActive",
      "navActivePill",
      "avatarRingOn",
      "avatarRingOff",
      "avatarBgOn",
      "avatarBgOff",
      "profileRing",
    ];
    for (const role of Object.keys(ROLE_COLORS) as Array<keyof typeof ROLE_COLORS>) {
      expect(Object.keys(ROLE_COLORS[role])).toEqual(expectedProps);
    }
  });
});
