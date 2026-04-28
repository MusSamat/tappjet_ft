import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatingStars } from "@/components/ui/rating-stars";

describe("RatingStars", () => {
  it("has correct aria-label with value and max", () => {
    render(<RatingStars value={4.2} />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Рейтинг 4.2 из 5");
  });

  it("uses custom max in aria-label", () => {
    render(<RatingStars value={3} max={10} />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Рейтинг 3.0 из 10");
  });

  it("shows numeric value text when showValue=true", () => {
    render(<RatingStars value={3.7} showValue />);
    expect(screen.getByText("3.7")).toBeInTheDocument();
  });

  it("hides numeric value by default", () => {
    render(<RatingStars value={3.7} />);
    expect(screen.queryByText("3.7")).not.toBeInTheDocument();
  });

  it("formats value to one decimal place", () => {
    render(<RatingStars value={5} showValue />);
    expect(screen.getByText("5.0")).toBeInTheDocument();
  });

  it("renders max=5 stars by default", () => {
    render(<RatingStars value={3} />);
    // Stars are SVGs with aria-hidden — count them
    const stars = document.querySelectorAll('[aria-hidden="true"]');
    expect(stars.length).toBeGreaterThanOrEqual(5);
  });

  it("renders without error for half-value (3.25 rounds to 3.5)", () => {
    render(<RatingStars value={3.25} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders without error for value=0", () => {
    render(<RatingStars value={0} />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Рейтинг 0.0 из 5");
  });
});
