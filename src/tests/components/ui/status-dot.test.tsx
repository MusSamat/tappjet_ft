import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusDot } from "@/components/ui/status-dot";

describe("StatusDot", () => {
  it("renders label text", () => {
    render(<StatusDot status="pending" label="Ожидание" />);
    expect(screen.getByText("Ожидание")).toBeInTheDocument();
  });

  it("accepted status applies teal wrapper class", () => {
    const { container } = render(<StatusDot status="accepted" label="x" />);
    expect(container.firstChild).toHaveClass("bg-teal-50");
  });

  it("rejected status applies red wrapper class", () => {
    const { container } = render(<StatusDot status="rejected" label="x" />);
    expect(container.firstChild).toHaveClass("bg-red-50");
  });

  it("cancelled status applies gray wrapper class", () => {
    const { container } = render(<StatusDot status="cancelled" label="x" />);
    expect(container.firstChild).toHaveClass("bg-gray-100");
  });

  it("completed status applies teal wrapper class", () => {
    const { container } = render(<StatusDot status="completed" label="x" />);
    expect(container.firstChild).toHaveClass("bg-teal-50");
  });

  it("pending is the default status", () => {
    const { container } = render(<StatusDot label="x" />);
    expect(container.firstChild).toHaveClass("bg-amber-50");
  });

  it("merges custom className", () => {
    const { container } = render(<StatusDot status="pending" label="x" className="extra" />);
    expect(container.firstChild).toHaveClass("extra");
  });

  it("renders all statuses without error", () => {
    const statuses = ["accepted", "pending", "rejected", "cancelled", "completed"] as const;
    for (const status of statuses) {
      const { unmount } = render(<StatusDot status={status} label={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
      unmount();
    }
  });
});
