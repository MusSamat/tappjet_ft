import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { PasswordInput } from "@/components/ui/password-input";

describe("PasswordInput", () => {
  it("renders an input of type password initially", () => {
    render(<PasswordInput />);
    const input = document.querySelector("input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe("password");
  });

  it("clicking toggle button changes type to text (shows password)", () => {
    render(<PasswordInput />);
    const toggle = screen.getByRole("button", { name: "Показать пароль" });
    fireEvent.click(toggle);
    const input = document.querySelector("input") as HTMLInputElement;
    expect(input.type).toBe("text");
  });

  it("clicking toggle again restores type password", () => {
    render(<PasswordInput />);
    const toggle = screen.getByRole("button", { name: "Показать пароль" });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole("button", { name: "Скрыть пароль" }));
    const input = document.querySelector("input") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("toggle button aria-label changes with state", () => {
    render(<PasswordInput />);
    expect(screen.getByRole("button", { name: "Показать пароль" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Показать пароль" }));
    expect(screen.getByRole("button", { name: "Скрыть пароль" })).toBeInTheDocument();
  });

  it("invalid=true applies error border class", () => {
    const { container } = render(<PasswordInput invalid={true} />);
    expect(container.firstChild).toHaveClass("border-error");
  });

  it("forwards ref to the input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<PasswordInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
