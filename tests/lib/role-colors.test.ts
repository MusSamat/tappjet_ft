import { describe, it, expect } from "vitest";
import { ROLE_COLORS, ROLE_THEME, type UiRole } from "@/lib/role-colors";

describe("ROLE_THEME", () => {
  it("covers all three UI roles", () => {
    expect(Object.keys(ROLE_THEME).sort()).toEqual(["driver", "guest", "passenger"]);
  });

  it("guest accents are ink (warm gray)", () => {
    expect(ROLE_THEME.guest.textOn).toContain("text-ink-");
    expect(ROLE_THEME.guest.tabUnderline).toBe("bg-ink-500");
  });

  // Current assignment (role-colors.ts): passenger = brand (teal), driver = grape.
  it("passenger accents are brand (teal)", () => {
    expect(ROLE_THEME.passenger.textOn).toContain("text-brand-");
    expect(ROLE_THEME.passenger.ctaFilled).toContain("bg-brand-600");
    expect(ROLE_THEME.passenger.tabUnderline).toBe("bg-brand-500");
  });

  it("driver accents are grape (indigo)", () => {
    expect(ROLE_THEME.driver.textOn).toContain("text-grape-");
    expect(ROLE_THEME.driver.ctaFilled).toContain("bg-grape-500");
    expect(ROLE_THEME.driver.tabUnderline).toBe("bg-grape-500");
  });

  it("labelKey and icon match the role", () => {
    expect(ROLE_THEME.guest.labelKey).toBe("guest");
    expect(ROLE_THEME.guest.icon).toBe("eye");
    expect(ROLE_THEME.passenger.labelKey).toBe("passenger");
    expect(ROLE_THEME.passenger.icon).toBe("user");
    expect(ROLE_THEME.driver.labelKey).toBe("driver");
    expect(ROLE_THEME.driver.icon).toBe("car-front");
  });

  it("all roles expose the same theme property names", () => {
    const roles = Object.keys(ROLE_THEME) as UiRole[];
    const reference = Object.keys(ROLE_THEME.guest).sort();
    for (const role of roles) {
      expect(Object.keys(ROLE_THEME[role]).sort()).toEqual(reference);
    }
  });

  it("roles produce distinct accent recipes", () => {
    expect(ROLE_THEME.passenger.badge).not.toBe(ROLE_THEME.driver.badge);
    expect(ROLE_THEME.guest.badge).not.toBe(ROLE_THEME.passenger.badge);
  });
});

describe("ROLE_COLORS (deprecated pre-redesign map)", () => {
  it("passenger has navActive: text-brand-600", () => {
    expect(ROLE_COLORS.passenger.navActive).toBe("text-brand-600");
  });

  it("driver has navActive: text-grape-600", () => {
    expect(ROLE_COLORS.driver.navActive).toBe("text-grape-600");
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
