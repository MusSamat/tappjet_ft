import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/",
}));

// Force the Telegram runtime so the gate reads localStorage (per-device flag).
vi.mock("@/lib/detect-runtime", () => ({ detectRuntime: () => "telegram" }));

// Import after the mocks are registered.
const { OnboardingGate } = await import("@/components/features/onboarding/onboarding-gate");

const SEEN_KEY = "tappjet_onboarding_seen";

describe("OnboardingGate", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders nothing (null)", () => {
    localStorage.setItem(SEEN_KEY, "1");
    const { container } = render(<OnboardingGate />);
    expect(container.firstChild).toBeNull();
  });

  it("redirects to /onboarding when the seen flag is absent", () => {
    render(<OnboardingGate />);
    expect(mockReplace).toHaveBeenCalledWith("/onboarding");
  });

  it("does NOT redirect when the seen flag is present", () => {
    localStorage.setItem(SEEN_KEY, "1");
    render(<OnboardingGate />);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
