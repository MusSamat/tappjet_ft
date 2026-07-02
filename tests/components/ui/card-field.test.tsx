import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardField } from "@/components/ui/card-field";
import { createRef as reactCreateRef } from "react";

describe("CardField", () => {
  it("renders the label text", () => {
    render(<CardField label="Откуда" icon={<span />} />);
    expect(screen.getByText("Откуда")).toBeInTheDocument();
  });

  it("renders the icon", () => {
    render(<CardField label="Откуда" icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders value as defaultValue of the input", () => {
    render(<CardField label="Откуда" icon={<span />} value="Бишкек" />);
    expect(screen.getByRole("textbox")).toHaveValue("Бишкек");
  });

  it("renders placeholder prop", () => {
    render(<CardField label="Откуда" icon={<span />} placeholder="Введите город" />);
    expect(screen.getByPlaceholderText("Введите город")).toBeInTheDocument();
  });

  it("readOnly makes input read-only", () => {
    render(<CardField label="Откуда" icon={<span />} readOnly />);
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  });

  it("forwards ref to the input", () => {
    const ref = reactCreateRef<HTMLInputElement>();
    render(<CardField label="Откуда" icon={<span />} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
