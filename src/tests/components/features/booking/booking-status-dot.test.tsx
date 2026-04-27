import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingStatusDot } from "@/components/features/booking/booking-status-dot";

describe("BookingStatusDot", () => {
  it("returns null for undefined status", () => {
    const { container } = render(<BookingStatusDot status={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders pending → Ожидание", () => {
    render(<BookingStatusDot status="pending" />);
    expect(screen.getByText("Ожидание")).toBeInTheDocument();
  });

  it("renders accepted → Принято", () => {
    render(<BookingStatusDot status="accepted" />);
    expect(screen.getByText("Принято")).toBeInTheDocument();
  });

  it("renders rejected → Отклонено", () => {
    render(<BookingStatusDot status="rejected" />);
    expect(screen.getByText("Отклонено")).toBeInTheDocument();
  });

  it("renders cancelled_by_passenger → Отменено пассажиром", () => {
    render(<BookingStatusDot status="cancelled_by_passenger" />);
    expect(screen.getByText("Отменено пассажиром")).toBeInTheDocument();
  });

  it("renders cancelled_by_driver → Отменено водителем", () => {
    render(<BookingStatusDot status="cancelled_by_driver" />);
    expect(screen.getByText("Отменено водителем")).toBeInTheDocument();
  });

  it("renders cancelled_late → Поздняя отмена", () => {
    render(<BookingStatusDot status="cancelled_late" />);
    expect(screen.getByText("Поздняя отмена")).toBeInTheDocument();
  });

  it("renders no_show → Не явился", () => {
    render(<BookingStatusDot status="no_show" />);
    expect(screen.getByText("Не явился")).toBeInTheDocument();
  });

  it("renders completed → Завершено", () => {
    render(<BookingStatusDot status="completed" />);
    expect(screen.getByText("Завершено")).toBeInTheDocument();
  });

  it("renders expired → Истёк срок", () => {
    render(<BookingStatusDot status="expired" />);
    expect(screen.getByText("Истёк срок")).toBeInTheDocument();
  });
});
