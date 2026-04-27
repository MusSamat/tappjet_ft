import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "@/components/ui/container";

describe("Container", () => {
  it("renders children", () => {
    render(<Container>Content</Container>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("has max-w-[1500px] class", () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild).toHaveClass("max-w-[1500px]");
  });

  it("merges extra className", () => {
    const { container } = render(<Container className="extra">Content</Container>);
    expect(container.firstChild).toHaveClass("extra");
    expect(container.firstChild).toHaveClass("max-w-[1500px]");
  });
});
