import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("has type=button by default (does not submit forms accidentally)", () => {
    render(<Button>x</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("accepts type override", () => {
    render(<Button type="submit">x</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>x</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop set", () => {
    render(<Button disabled>x</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>x</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies submit variant class (amber)", () => {
    render(<Button variant="submit">x</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-amber-500");
  });

  it("applies primary variant class (teal) by default", () => {
    render(<Button>x</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-teal-600");
  });

  it("applies danger variant class", () => {
    render(<Button variant="danger">x</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-50");
  });

  it("applies sm size class", () => {
    render(<Button size="sm">x</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-9");
  });

  it("applies lg size class", () => {
    render(<Button size="lg">x</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-[52px]");
  });

  it("merges custom className", () => {
    render(<Button className="my-custom-class">x</Button>);
    expect(screen.getByRole("button")).toHaveClass("my-custom-class");
  });

  it("forwards ref to underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>x</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
