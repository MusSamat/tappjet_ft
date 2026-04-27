import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, VerifiedBadge, PendingBadge, SeatsBadge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("renders icon alongside children", () => {
    render(<Badge icon={<span data-testid="icon" />}>Label</Badge>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("applies danger variant classes", () => {
    const { container } = render(<Badge variant="danger">Error</Badge>);
    expect(container.firstChild).toHaveClass("bg-red-100");
  });

  it("applies success variant classes", () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    expect(container.firstChild).toHaveClass("bg-teal-100");
  });

  it("applies neutral variant by default", () => {
    const { container } = render(<Badge>Neutral</Badge>);
    expect(container.firstChild).toHaveClass("bg-gray-100");
  });

  it("merges custom className", () => {
    const { container } = render(<Badge className="extra">x</Badge>);
    expect(container.firstChild).toHaveClass("extra");
  });
});

describe("VerifiedBadge", () => {
  it("renders Верифицирован", () => {
    render(<VerifiedBadge />);
    expect(screen.getByText("Верифицирован")).toBeInTheDocument();
  });

  it("uses verified (teal) variant", () => {
    const { container } = render(<VerifiedBadge />);
    expect(container.firstChild).toHaveClass("bg-teal-100");
  });
});

describe("PendingBadge", () => {
  it("renders Ожидание", () => {
    render(<PendingBadge />);
    expect(screen.getByText("Ожидание")).toBeInTheDocument();
  });

  it("uses pending (amber) variant", () => {
    const { container } = render(<PendingBadge />);
    expect(container.firstChild).toHaveClass("bg-amber-100");
  });
});

describe("SeatsBadge", () => {
  it("renders available out of total", () => {
    render(<SeatsBadge available={2} total={4} />);
    expect(screen.getByText(/2 из 4/)).toBeInTheDocument();
  });

  it("renders zero available", () => {
    render(<SeatsBadge available={0} total={4} />);
    expect(screen.getByText(/0 из 4/)).toBeInTheDocument();
  });
});
