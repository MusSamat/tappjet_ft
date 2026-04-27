import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhoneInput } from "@/components/ui/phone-input";

describe("PhoneInput", () => {
  it("displays the +996 prefix", () => {
    render(<PhoneInput />);
    expect(screen.getByText("+996")).toBeInTheDocument();
  });

  it("renders the placeholder", () => {
    render(<PhoneInput />);
    expect(screen.getByPlaceholderText("XXX XX XX XX")).toBeInTheDocument();
  });

  it("calls onValueChange with full E.164 number on input", () => {
    const onValueChange = vi.fn();
    render(<PhoneInput onValueChange={onValueChange} />);
    fireEvent.change(screen.getByPlaceholderText("XXX XX XX XX"), {
      target: { value: "700123456" },
    });
    expect(onValueChange).toHaveBeenCalledWith("+996700123456");
  });

  it("strips non-digit characters from input", () => {
    const onValueChange = vi.fn();
    render(<PhoneInput onValueChange={onValueChange} />);
    fireEvent.change(screen.getByPlaceholderText("XXX XX XX XX"), {
      target: { value: "abc700def" },
    });
    expect(onValueChange).toHaveBeenCalledWith("+996700");
  });

  it("limits input to 9 digits", () => {
    const onValueChange = vi.fn();
    render(<PhoneInput onValueChange={onValueChange} />);
    fireEvent.change(screen.getByPlaceholderText("XXX XX XX XX"), {
      target: { value: "7001234567890" },
    });
    expect(onValueChange).toHaveBeenCalledWith("+996700123456");
  });

  it("calls onValueChange with empty string when cleared", () => {
    const onValueChange = vi.fn();
    // Start with a value so the input is non-empty, then clear it
    render(<PhoneInput value="+996700000000" onValueChange={onValueChange} />);
    onValueChange.mockClear();
    fireEvent.change(screen.getByPlaceholderText("XXX XX XX XX"), {
      target: { value: "" },
    });
    expect(onValueChange).toHaveBeenCalledWith("");
  });

  it("formats local part with spaces (XXX XX XX XX)", () => {
    render(<PhoneInput value="+996700000000" />);
    const input = screen.getByPlaceholderText("XXX XX XX XX") as HTMLInputElement;
    expect(input.value).toBe("700 00 00 00");
  });

  it("syncs with external value changes via useEffect", () => {
    const { rerender } = render(<PhoneInput value="+996700000000" />);
    const input = screen.getByPlaceholderText("XXX XX XX XX") as HTMLInputElement;
    expect(input.value).toBe("700 00 00 00");
    rerender(<PhoneInput value="+996555111222" />);
    expect(input.value).toBe("555 11 12 22");
  });

  it("renders hint text when provided", () => {
    render(<PhoneInput hint="Введите номер" />);
    expect(screen.getByText("Введите номер")).toBeInTheDocument();
  });

  it("hint has error color when invalid", () => {
    render(<PhoneInput hint="Неверный номер" invalid />);
    const hint = screen.getByText("Неверный номер");
    expect(hint).toHaveClass("text-error");
  });

  it("does not render hint when not provided", () => {
    render(<PhoneInput />);
    expect(screen.queryByText(/hint/i)).not.toBeInTheDocument();
  });
});
