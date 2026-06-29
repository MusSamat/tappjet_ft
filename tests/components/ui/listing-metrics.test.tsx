import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListingMetrics } from "@/components/ui/listing-metrics";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

describe("ListingMetrics", () => {
  it("renders view and like counts", () => {
    render(<ListingMetrics metrics={{ views: 42, likes: 7 }} />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders nothing when metrics is null", () => {
    const { container } = render(<ListingMetrics metrics={null} />);
    expect(container.firstChild).toBeNull();
  });
});
