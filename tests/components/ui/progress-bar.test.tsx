import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/ui/progress-bar";

describe("ProgressBar", () => {
  it("renders with role progressbar", () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("aria-valuenow equals the value prop", () => {
    render(<ProgressBar value={30} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "30");
  });

  it("aria-valuemax equals the max prop (default 100)", () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "100");

    render(<ProgressBar value={2} max={4} />);
    expect(screen.getAllByRole("progressbar")[1]).toHaveAttribute("aria-valuemax", "4");
  });

  it("renders label text when provided", () => {
    render(<ProgressBar value={50} label="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("clamps 0% at value=0", () => {
    const { container } = render(<ProgressBar value={0} />);
    const bar = container.querySelector("[style]") as HTMLElement;
    expect(bar.style.width).toBe("0%");
  });

  it("clamps 100% at value > max", () => {
    const { container } = render(<ProgressBar value={200} max={100} />);
    const bar = container.querySelector("[style]") as HTMLElement;
    expect(bar.style.width).toBe("100%");
  });

  it("style.width is 50% when value=50, max=100", () => {
    const { container } = render(<ProgressBar value={50} max={100} />);
    const bar = container.querySelector("[style]") as HTMLElement;
    expect(bar.style.width).toBe("50%");
  });

  it("style.width is 25% when value=1, max=4", () => {
    const { container } = render(<ProgressBar value={1} max={4} />);
    const bar = container.querySelector("[style]") as HTMLElement;
    expect(bar.style.width).toBe("25%");
  });
});
