import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackButton } from "@/components/ui/back-button";

const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe("BackButton", () => {
  it("renders default label Назад", () => {
    render(<BackButton />);
    expect(screen.getByText("Назад")).toBeInTheDocument();
  });

  it("renders custom label prop", () => {
    render(<BackButton label="Вернуться" />);
    expect(screen.getByText("Вернуться")).toBeInTheDocument();
  });

  it("clicking the button calls router.back()", () => {
    mockBack.mockClear();
    render(<BackButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("renders a button element", () => {
    render(<BackButton />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
