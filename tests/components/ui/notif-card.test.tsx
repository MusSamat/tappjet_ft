import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotifCard } from "@/components/ui/notif-card";

describe("NotifCard", () => {
  it("renders children", () => {
    render(<NotifCard>Something happened</NotifCard>);
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("renders optional title prop", () => {
    render(<NotifCard title="Heads up">Body text</NotifCard>);
    expect(screen.getByText("Heads up")).toBeInTheDocument();
  });

  it("uses info variant by default (has bg-teal-50 class)", () => {
    const { container } = render(<NotifCard>Info message</NotifCard>);
    expect(container.firstChild).toHaveClass("bg-teal-50");
  });

  it("error variant has bg-red-50 class", () => {
    const { container } = render(<NotifCard variant="error">Error message</NotifCard>);
    expect(container.firstChild).toHaveClass("bg-red-50");
  });

  it("warning variant has bg-amber-50 class", () => {
    const { container } = render(<NotifCard variant="warning">Warning message</NotifCard>);
    expect(container.firstChild).toHaveClass("bg-amber-50");
  });

  it("success variant has bg-teal-50 class", () => {
    const { container } = render(<NotifCard variant="success">Success message</NotifCard>);
    expect(container.firstChild).toHaveClass("bg-teal-50");
  });

  it("renders custom icon when provided (overrides default icon)", () => {
    render(
      <NotifCard icon={<span data-testid="custom-icon" />}>With custom icon</NotifCard>,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
