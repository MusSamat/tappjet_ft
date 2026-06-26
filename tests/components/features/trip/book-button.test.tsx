import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookButton } from "@/components/features/trip/book-button";
import { useAuth } from "@/store/auth";
import { saveDeferredAction } from "@/lib/auth/deferred-action";
import { useRouter } from "next/navigation";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/store/auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/auth/deferred-action", () => ({
  saveDeferredAction: vi.fn(),
}));

// BookButton only decides whether to OPEN the add-phone modal — the modal's
// own OTP flow is covered in add-phone-modal.test.tsx. Stub it to a marker.
vi.mock("@/components/features/auth/add-phone-modal", () => ({
  AddPhoneModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="add-phone-modal" /> : null,
}));

type StoreState = {
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  user: { id: string; phoneVerified: boolean } | null;
  setSession: ReturnType<typeof vi.fn>;
};

function mockAuthWith(partial: Partial<StoreState> = {}) {
  const store: StoreState = {
    status: "authenticated",
    user: { id: "user-1", phoneVerified: true },
    setSession: vi.fn(),
    ...partial,
  };
  vi.mocked(useAuth).mockImplementation((selector: any) => selector(store));
  return store;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
});

describe("BookButton — auth states", () => {
  it("renders loading skeleton when auth is idle", () => {
    mockAuthWith({ status: "idle" });
    const { container } = render(<BookButton tripId="t1" seatsAvailable={3} />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders loading skeleton when auth is loading", () => {
    mockAuthWith({ status: "loading" });
    const { container } = render(<BookButton tripId="t1" seatsAvailable={3} />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});

describe("BookButton — own trip", () => {
  it("shows own-trip card when driverId matches user id", () => {
    mockAuthWith({ user: { id: "driver-1", phoneVerified: true } });
    render(<BookButton tripId="t1" seatsAvailable={3} driverId="driver-1" />);
    expect(screen.getByText("Это ваша поездка")).toBeInTheDocument();
  });

  it("does not show own-trip card when driverId differs", () => {
    mockAuthWith({ user: { id: "passenger-1", phoneVerified: true } });
    render(<BookButton tripId="t1" seatsAvailable={3} driverId="driver-1" />);
    expect(screen.queryByText("Это ваша поездка")).not.toBeInTheDocument();
  });
});

describe("BookButton — sold out", () => {
  it("shows sold-out card when seatsAvailable=0", () => {
    mockAuthWith();
    render(<BookButton tripId="t1" seatsAvailable={0} />);
    expect(screen.getByText("Мест больше нет")).toBeInTheDocument();
  });

  it("does not show sold-out card when seats available", () => {
    mockAuthWith();
    render(<BookButton tripId="t1" seatsAvailable={2} />);
    expect(screen.queryByText("Мест больше нет")).not.toBeInTheDocument();
  });
});

describe("BookButton — seat counter", () => {
  it("shows the Забронировать button", () => {
    mockAuthWith();
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    expect(screen.getByText("Забронировать")).toBeInTheDocument();
  });

  it("starts seat count at 1", () => {
    mockAuthWith();
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("increments seat count on + click", () => {
    mockAuthWith();
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    fireEvent.click(screen.getByLabelText("Больше мест"));
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("decrements seat count on − click", () => {
    mockAuthWith();
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    fireEvent.click(screen.getByLabelText("Больше мест"));
    fireEvent.click(screen.getByLabelText("Меньше мест"));
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("does not decrement below 1", () => {
    mockAuthWith();
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    fireEvent.click(screen.getByLabelText("Меньше мест"));
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("does not increment above seatsAvailable (capped at 4)", () => {
    mockAuthWith();
    render(<BookButton tripId="t1" seatsAvailable={2} />);
    fireEvent.click(screen.getByLabelText("Больше мест"));
    fireEvent.click(screen.getByLabelText("Больше мест"));
    // seatsAvailable=2, max=min(4,2)=2
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

describe("BookButton — unauthenticated click", () => {
  it("saves deferred action and redirects to login", () => {
    mockAuthWith({ status: "unauthenticated", user: null });
    render(<BookButton tripId="trip-abc" seatsAvailable={2} />);
    fireEvent.click(screen.getByText("Забронировать"));
    expect(vi.mocked(saveDeferredAction)).toHaveBeenCalledWith({
      action: "book_trip",
      trip_id: "trip-abc",
      seats: 1,
    });
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });
});

describe("BookButton — phone verification gate", () => {
  it("opens the add-phone modal when the user has no verified phone", () => {
    mockAuthWith({ user: { id: "user-1", phoneVerified: false } });
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    expect(screen.queryByTestId("add-phone-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Забронировать"));
    expect(screen.getByTestId("add-phone-modal")).toBeInTheDocument();
  });

  it("does not navigate to booking while phone is unverified", () => {
    mockAuthWith({ user: { id: "user-1", phoneVerified: false } });
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    fireEvent.click(screen.getByText("Забронировать"));
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("BookButton — authenticated + verified click", () => {
  it("navigates directly to booking when phone is verified", () => {
    mockAuthWith({ user: { id: "user-1", phoneVerified: true } });
    render(<BookButton tripId="trip-xyz" seatsAvailable={3} />);
    fireEvent.click(screen.getByLabelText("Больше мест")); // seats=2
    fireEvent.click(screen.getByText("Забронировать"));
    expect(mockPush).toHaveBeenCalledWith("/trips/trip-xyz/book?seats=2");
  });
});
