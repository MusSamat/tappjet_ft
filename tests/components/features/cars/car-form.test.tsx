import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CarForm } from "@/components/features/cars/car-form";

// Simple next-intl mock — return the key so we can target inputs by placeholder.
vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

describe("CarForm — shared add-car block (integration)", () => {
  function setup() {
    const onSubmit = vi.fn();
    render(<CarForm onSubmit={onSubmit} submitLabel="Add car" />);
    return {
      onSubmit,
      make: screen.getByPlaceholderText("make_ph") as HTMLInputElement,
      model: screen.getByPlaceholderText("model_ph") as HTMLInputElement,
      plate: screen.getByPlaceholderText("plate_ph") as HTMLInputElement,
      submit: screen.getByRole("button", { name: "Add car" }) as HTMLButtonElement,
    };
  }

  it("submit is disabled until make, model and a valid plate are filled", () => {
    const { make, model, plate, submit } = setup();
    expect(submit).toBeDisabled();
    fireEvent.change(make, { target: { value: "Toyota" } });
    fireEvent.change(model, { target: { value: "Camry" } });
    fireEvent.change(plate, { target: { value: "01" } }); // too short
    expect(submit).toBeDisabled();
  });

  it("shows the plate hint for an invalid plate", () => {
    const { plate } = setup();
    fireEvent.change(plate, { target: { value: "01" } });
    expect(screen.getByText("plate_hint")).toBeInTheDocument();
  });

  it("normalizes the plate as the user types (uppercase, strip symbols)", () => {
    const { plate } = setup();
    fireEvent.change(plate, { target: { value: "01 kg-123" } });
    expect(plate.value).toBe("01KG123");
  });

  it("enables submit and calls onSubmit with the normalized plate", () => {
    const { make, model, plate, submit, onSubmit } = setup();
    fireEvent.change(make, { target: { value: "  Toyota " } });
    fireEvent.change(model, { target: { value: " Camry " } });
    fireEvent.change(plate, { target: { value: "01kg123" } });
    expect(screen.queryByText("plate_hint")).not.toBeInTheDocument();
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ make: "Toyota", model: "Camry", plate: "01KG123", seatsCount: 4 }),
    );
  });

  it("showYear: renders a year field and validates the range", () => {
    const onChange = vi.fn();
    render(<CarForm onChange={onChange} showYear />);
    // No submit button in controlled mode.
    expect(screen.queryByRole("button", { name: /add/i })).not.toBeInTheDocument();
    const make = screen.getByPlaceholderText("make_ph");
    const model = screen.getByPlaceholderText("model_ph");
    const plate = screen.getByPlaceholderText("plate_ph");
    const year = screen.getByPlaceholderText("year_placeholder") as HTMLInputElement;
    fireEvent.change(make, { target: { value: "Toyota" } });
    fireEvent.change(model, { target: { value: "Camry" } });
    fireEvent.change(plate, { target: { value: "01KG123" } });
    // Non-digits stripped, capped at 4.
    fireEvent.change(year, { target: { value: "19a7" } });
    expect(year.value).toBe("197");
    fireEvent.change(year, { target: { value: "1200" } }); // too old
    // Latest onChange should report invalid while year is out of range.
    let last = onChange.mock.calls.at(-1)![0];
    expect(last.valid).toBe(false);
    fireEvent.change(year, { target: { value: "2015" } });
    last = onChange.mock.calls.at(-1)![0];
    expect(last).toMatchObject({ make: "Toyota", model: "Camry", plate: "01KG123", year: "2015", valid: true });
  });

  it("seats stepper defaults to 4 and is clamped between 1 and 7", () => {
    const { make, model, plate, submit, onSubmit } = setup();
    fireEvent.change(make, { target: { value: "Kia" } });
    fireEvent.change(model, { target: { value: "Rio" } });
    fireEvent.change(plate, { target: { value: "01KG999" } });
    const minus = screen.getByRole("button", { name: "−" });
    fireEvent.click(minus); // 4 -> 3
    fireEvent.click(minus); // 3 -> 2
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ seatsCount: 2 }));
  });
});
