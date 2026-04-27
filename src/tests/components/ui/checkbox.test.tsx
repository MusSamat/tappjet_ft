import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox", () => {
  it("renders an unchecked checkbox by default", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("renders in checked state when checked={true}", () => {
    render(<Checkbox checked={true} onCheckedChange={vi.fn()} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
  });

  it("fires onCheckedChange when clicked", () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledOnce();
  });

  it("disabled state: aria-disabled and does not fire callback", () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox disabled onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
    fireEvent.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("merges custom className", () => {
    render(<Checkbox className="extra-class" />);
    expect(screen.getByRole("checkbox")).toHaveClass("extra-class");
  });
});
