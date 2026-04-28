import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRoleColors } from "@/lib/hooks/use-role-colors";
import { useAuth } from "@/store/auth";
import { ROLE_COLORS } from "@/lib/role-colors";

vi.mock("@/store/auth", () => ({
  useAuth: vi.fn(),
}));

function mockMode(mode: "passenger" | "driver" | null | undefined) {
  vi.mocked(useAuth).mockImplementation((sel: any) => sel({ activeMode: mode }));
}

describe("useRoleColors", () => {
  it("returns passenger colors when activeMode is passenger", () => {
    mockMode("passenger");
    const { result } = renderHook(() => useRoleColors());
    expect(result.current).toEqual(ROLE_COLORS.passenger);
  });

  it("returns driver colors when activeMode is driver", () => {
    mockMode("driver");
    const { result } = renderHook(() => useRoleColors());
    expect(result.current).toEqual(ROLE_COLORS.driver);
  });

  it("returns passenger colors when activeMode is null (fallback)", () => {
    mockMode(null);
    const { result } = renderHook(() => useRoleColors());
    expect(result.current).toEqual(ROLE_COLORS.passenger);
  });

  it("passenger navActive is text-teal-600", () => {
    mockMode("passenger");
    const { result } = renderHook(() => useRoleColors());
    expect(result.current.navActive).toBe("text-teal-600");
  });

  it("driver navActive is text-sky-600", () => {
    mockMode("driver");
    const { result } = renderHook(() => useRoleColors());
    expect(result.current.navActive).toBe("text-sky-600");
  });
});
