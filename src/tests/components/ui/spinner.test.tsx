import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "@/components/ui/spinner";

describe("Spinner", () => {
  it("has role=status", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("default aria-label is Загрузка", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Загрузка");
  });

  it("accepts custom label", () => {
    render(<Spinner label="Отправка" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Отправка");
  });

  it("applies size via inline style", () => {
    render(<Spinner size={40} />);
    const el = screen.getByRole("status");
    expect(el).toHaveStyle({ width: "40px", height: "40px" });
  });

  it("applies default size 20", () => {
    render(<Spinner />);
    const el = screen.getByRole("status");
    expect(el).toHaveStyle({ width: "20px", height: "20px" });
  });

  it("merges custom className", () => {
    render(<Spinner className="my-class" />);
    expect(screen.getByRole("status")).toHaveClass("my-class");
  });
});
