import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Import after vi.mock so the mock is in place
const { OnboardingGate } = await import("@/components/features/onboarding/onboarding-gate");

describe("OnboardingGate", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders nothing (null)", () => {
    localStorage.setItem("tappjet_onboarding_done", "1");
    const { container } = render(<OnboardingGate />);
    expect(container.firstChild).toBeNull();
  });

  it("redirects to /onboarding when key is absent", () => {
    render(<OnboardingGate />);
    expect(mockReplace).toHaveBeenCalledWith("/onboarding");
  });

  it("does NOT redirect when onboarding key is present", () => {
    localStorage.setItem("tappjet_onboarding_done", "1");
    render(<OnboardingGate />);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
