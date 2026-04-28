import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("rows defaults to 4", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "4");
  });

  it("rows can be overridden", () => {
    render(<Textarea rows={8} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "8");
  });

  it("forwards ref to textarea", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("applies custom className", () => {
    render(<Textarea className="custom-class" />);
    expect(screen.getByRole("textbox")).toHaveClass("custom-class");
  });

  it("disabled state", () => {
    render(<Textarea disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
