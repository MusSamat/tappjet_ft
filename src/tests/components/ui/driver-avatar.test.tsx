import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DriverAvatar } from "@/components/ui/driver-avatar";

vi.mock("next/image", () => ({
  default: ({ src, alt, onError, ...rest }: any) => (
    <img src={src} alt={alt} onError={onError} />
  ),
}));

describe("DriverAvatar", () => {
  it("shows initials from first letters of name words", () => {
    render(<DriverAvatar name="Иван Петров" />);
    expect(screen.getByText("ИП")).toBeInTheDocument();
  });

  it("shows ? for empty name", () => {
    render(<DriverAvatar name="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("single word name renders first letter", () => {
    render(<DriverAvatar name="Алексей" />);
    expect(screen.getByText("А")).toBeInTheDocument();
  });

  it("renders img when src is provided", () => {
    render(<DriverAvatar name="Иван" src="https://example.com/photo.jpg" />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("shows initials when src is null", () => {
    render(<DriverAvatar name="Иван" src={null} />);
    expect(screen.getByText("И")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("falls back to initials when img onError fires", () => {
    render(<DriverAvatar name="Иван" src="https://example.com/bad.jpg" />);
    const img = screen.getByRole("img");
    fireEvent.error(img);
    expect(screen.getByText("И")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("size=lg applies h-14 w-14 class", () => {
    const { container } = render(<DriverAvatar name="Иван" size="lg" />);
    expect(container.firstChild).toHaveClass("h-14", "w-14");
  });

  it("size=sm applies h-8 w-8 class", () => {
    const { container } = render(<DriverAvatar name="Иван" size="sm" />);
    expect(container.firstChild).toHaveClass("h-8", "w-8");
  });
});
