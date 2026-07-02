import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRoleColors, useRoleTheme, useUiRole } from "@/lib/hooks/use-role-colors";
import { useAuth } from "@/store/auth";
import { ROLE_COLORS, ROLE_THEME } from "@/lib/role-colors";

vi.mock("@/store/auth", () => ({
  useAuth: vi.fn(),
}));

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

function mockAuth(status: AuthStatus, activeMode: "passenger" | "driver" | null = null) {
  vi.mocked(useAuth).mockImplementation((sel: any) => sel({ status, activeMode }));
}

describe("useUiRole — guest derivation", () => {
  it.each(["idle", "loading", "unauthenticated"] as const)(
    "status=%s → guest even when activeMode is set",
    (status) => {
      mockAuth(status, "driver");
      const { result } = renderHook(() => useUiRole());
      expect(result.current).toBe("guest");
    },
  );

  it("authenticated + activeMode=driver → driver", () => {
    mockAuth("authenticated", "driver");
    const { result } = renderHook(() => useUiRole());
    expect(result.current).toBe("driver");
  });

  it("authenticated + activeMode=passenger → passenger", () => {
    mockAuth("authenticated", "passenger");
    const { result } = renderHook(() => useUiRole());
    expect(result.current).toBe("passenger");
  });

  it("authenticated with no activeMode falls back to passenger", () => {
    mockAuth("authenticated", null);
    const { result } = renderHook(() => useUiRole());
    expect(result.current).toBe("passenger");
  });
});

describe("useRoleTheme", () => {
  it("returns the guest theme when not authenticated", () => {
    mockAuth("unauthenticated");
    const { result } = renderHook(() => useRoleTheme());
    expect(result.current).toEqual({ role: "guest", theme: ROLE_THEME.guest });
  });

  it("returns the driver theme for an authenticated driver", () => {
    mockAuth("authenticated", "driver");
    const { result } = renderHook(() => useRoleTheme());
    expect(result.current).toEqual({ role: "driver", theme: ROLE_THEME.driver });
  });

  it("returns the passenger theme for an authenticated passenger", () => {
    mockAuth("authenticated", "passenger");
    const { result } = renderHook(() => useRoleTheme());
    expect(result.current).toEqual({ role: "passenger", theme: ROLE_THEME.passenger });
  });
});

describe("useRoleColors (deprecated)", () => {
  it("returns passenger colors when activeMode is passenger", () => {
    mockAuth("authenticated", "passenger");
    const { result } = renderHook(() => useRoleColors());
    expect(result.current).toEqual(ROLE_COLORS.passenger);
  });

  it("returns driver colors when activeMode is driver", () => {
    mockAuth("authenticated", "driver");
    const { result } = renderHook(() => useRoleColors());
    expect(result.current).toEqual(ROLE_COLORS.driver);
  });

  it("returns passenger colors when activeMode is null (fallback)", () => {
    mockAuth("authenticated", null);
    const { result } = renderHook(() => useRoleColors());
    expect(result.current).toEqual(ROLE_COLORS.passenger);
  });
});
