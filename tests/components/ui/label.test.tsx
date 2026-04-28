import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("renders children text", () => {
    render(<Label>Email</Label>);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders as a label element", () => {
    render(<Label>Name</Label>);
    expect(screen.getByText("Name").tagName).toBe("LABEL");
  });

  it("htmlFor prop sets the for attribute", () => {
    render(<Label htmlFor="email-input">Email</Label>);
    expect(screen.getByText("Email")).toHaveAttribute("for", "email-input");
  });

  it("merges custom className", () => {
    render(<Label className="custom-label">Text</Label>);
    expect(screen.getByText("Text")).toHaveClass("custom-label");
  });
});
