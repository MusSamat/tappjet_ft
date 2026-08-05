import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CarForm } from "@/components/features/cars/car-form";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));
vi.mock("@/lib/api/cars", () => ({
  listCarBrands: vi.fn(() => Promise.resolve([{ id: 1, name: "Toyota" }])),
  listCarModels: vi.fn(() => Promise.resolve([{ id: 101, name: "Camry", bodyType: "sedan" }])),
  listCarColors: vi.fn(() => Promise.resolve([{ id: 1, nameRu: "Белый", nameKy: "Ак", hex: "#FFFFFF" }])),
}));

function renderForm(props: Parameters<typeof CarForm>[0]) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CarForm {...props} />
    </QueryClientProvider>,
  );
}

describe("CarForm — catalog picker + free-text fallback", () => {
  it("selects brand + model from the catalog and submits them as text", async () => {
    const onSubmit = vi.fn();
    renderForm({ onSubmit, submitLabel: "Add car" });
    // Brand loads into the first <select>.
    await waitFor(() => expect(screen.getByRole("option", { name: "Toyota" })).toBeInTheDocument());
    const brandSelect = screen.getAllByRole("combobox")[0]!;
    fireEvent.change(brandSelect, { target: { value: "1" } }); // Toyota
    // Model loads for the picked brand.
    await waitFor(() => expect(screen.getByRole("option", { name: "Camry" })).toBeInTheDocument());
    const modelSelect = screen.getAllByRole("combobox")[1]!;
    fireEvent.change(modelSelect, { target: { value: "Camry" } });
    fireEvent.change(screen.getByPlaceholderText("plate_ph"), { target: { value: "01KG123" } });

    const submit = screen.getByRole("button", { name: "Add car" });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ make: "Toyota", model: "Camry", plate: "01KG123", seatsCount: 4 }),
    );
  });

  it("free-text fallback: «manual» reveals text inputs saved as-is", async () => {
    const onSubmit = vi.fn();
    renderForm({ onSubmit, submitLabel: "Add car" });
    await waitFor(() => expect(screen.getByRole("option", { name: "Toyota" })).toBeInTheDocument());
    const brandSelect = screen.getAllByRole("combobox")[0]!;
    fireEvent.change(brandSelect, { target: { value: "__manual__" } });
    // Now make + model are free-text inputs.
    fireEvent.change(screen.getByPlaceholderText("make_ph"), { target: { value: "Тесла" } });
    fireEvent.change(screen.getByPlaceholderText("model_ph"), { target: { value: "Model S" } });
    fireEvent.change(screen.getByPlaceholderText("plate_ph"), { target: { value: "01KG777" } });
    fireEvent.click(screen.getByRole("button", { name: "Add car" }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ make: "Тесла", model: "Model S", plate: "01KG777" }),
    );
  });

  it("normalizes the plate as the user types", () => {
    renderForm({ onSubmit: vi.fn(), submitLabel: "Add car" });
    const plate = screen.getByPlaceholderText("plate_ph") as HTMLInputElement;
    fireEvent.change(plate, { target: { value: "01 kg-123" } });
    expect(plate.value).toBe("01KG123");
  });

  it("showYear: prefilled car starts in manual mode and validates the year", async () => {
    const onChange = vi.fn();
    renderForm({ onChange, showYear: true, initial: { make: "Kia", model: "Rio", plate: "01KG999", seatsCount: 4 } });
    // Prefill → manual text inputs are shown.
    expect((screen.getByPlaceholderText("make_ph") as HTMLInputElement).value).toBe("Kia");
    const year = screen.getByPlaceholderText("year_placeholder") as HTMLInputElement;
    fireEvent.change(year, { target: { value: "1200" } }); // too old → invalid
    await waitFor(() => expect(onChange.mock.calls.at(-1)![0].valid).toBe(false));
    fireEvent.change(year, { target: { value: "2015" } });
    await waitFor(() => expect(onChange.mock.calls.at(-1)![0]).toMatchObject({ make: "Kia", model: "Rio", year: "2015", valid: true }));
  });
});
