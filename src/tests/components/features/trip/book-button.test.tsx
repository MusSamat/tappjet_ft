import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BookButton } from "@/components/features/trip/book-button";
import { useAuth } from "@/store/auth";
import { saveDeferredAction } from "@/lib/auth/deferred-action";
import { sendOtp, confirmPhoneAdd } from "@/lib/api/auth";
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

vi.mock("@/lib/api/auth", () => ({
  sendOtp: vi.fn(),
  confirmPhoneAdd: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  extractError: vi.fn((e: unknown) => e),
}));

vi.mock("@/lib/utils/api-error", () => ({
  friendlyError: vi.fn((e: unknown) => String((e as any)?.message ?? e)),
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
  vi.mocked(sendOtp).mockResolvedValue({ expiresInSec: 120 });
  vi.mocked(confirmPhoneAdd).mockResolvedValue({ accessToken: "tok", user: { id: "user-1" } } as any);
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

describe("BookButton — phone verification modal", () => {
  it("shows phone modal when user has no verified phone", () => {
    mockAuthWith({ user: { id: "user-1", phoneVerified: false } });
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    fireEvent.click(screen.getByText("Забронировать"));
    expect(screen.getByText("Укажите номер телефона")).toBeInTheDocument();
  });

  it("advances to OTP step after entering phone and clicking Получить код", async () => {
    mockAuthWith({ user: { id: "user-1", phoneVerified: false } });
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    fireEvent.click(screen.getByText("Забронировать"));
    fireEvent.change(screen.getByPlaceholderText("+996 700 000 000"), {
      target: { value: "+996700000000" },
    });
    fireEvent.click(screen.getByText("Получить код"));
    await waitFor(() => {
      expect(screen.getByText("Введите код из SMS")).toBeInTheDocument();
    });
    expect(vi.mocked(sendOtp)).toHaveBeenCalledWith("+996700000000");
  });

  it("confirm button is disabled when OTP has fewer than 6 digits", async () => {
    mockAuthWith({ user: { id: "user-1", phoneVerified: false } });
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    fireEvent.click(screen.getByText("Забронировать"));
    fireEvent.change(screen.getByPlaceholderText("+996 700 000 000"), {
      target: { value: "+996700000000" },
    });
    fireEvent.click(screen.getByText("Получить код"));
    await waitFor(() => screen.getByText("Введите код из SMS"));
    // 4 digits — still disabled (was the bug: it was enabled at 4)
    fireEvent.change(screen.getByPlaceholderText("_ _ _ _ _ _"), {
      target: { value: "1234" },
    });
    expect(screen.getByText("Подтвердить").closest("button")).toBeDisabled();
  });

  it("confirm button becomes enabled at exactly 6 digits", async () => {
    mockAuthWith({ user: { id: "user-1", phoneVerified: false } });
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    fireEvent.click(screen.getByText("Забронировать"));
    fireEvent.change(screen.getByPlaceholderText("+996 700 000 000"), {
      target: { value: "+996700000000" },
    });
    fireEvent.click(screen.getByText("Получить код"));
    await waitFor(() => screen.getByText("Введите код из SMS"));
    fireEvent.change(screen.getByPlaceholderText("_ _ _ _ _ _"), {
      target: { value: "123456" },
    });
    expect(screen.getByText("Подтвердить").closest("button")).not.toBeDisabled();
  });

  it("successful OTP verify closes modal and navigates to booking", async () => {
    const store = mockAuthWith({ user: { id: "user-1", phoneVerified: false } });
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    fireEvent.click(screen.getByText("Забронировать"));
    fireEvent.change(screen.getByPlaceholderText("+996 700 000 000"), {
      target: { value: "+996700000000" },
    });
    fireEvent.click(screen.getByText("Получить код"));
    await waitFor(() => screen.getByText("Введите код из SMS"));
    fireEvent.change(screen.getByPlaceholderText("_ _ _ _ _ _"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByText("Подтвердить"));
    await waitFor(() => {
      expect(vi.mocked(confirmPhoneAdd)).toHaveBeenCalledWith("+996700000000", "123456");
      expect(store.setSession).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/trips/t1/book?seats=1");
    });
  });

  it("shows error message when sendOtp fails", async () => {
    vi.mocked(sendOtp).mockRejectedValueOnce({ message: "Слишком много запросов" });
    mockAuthWith({ user: { id: "user-1", phoneVerified: false } });
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    fireEvent.click(screen.getByText("Забронировать"));
    fireEvent.change(screen.getByPlaceholderText("+996 700 000 000"), {
      target: { value: "+996700000000" },
    });
    fireEvent.click(screen.getByText("Получить код"));
    await waitFor(() => {
      expect(screen.getByText("Слишком много запросов")).toBeInTheDocument();
    });
  });

  it("clicking backdrop closes the modal", () => {
    mockAuthWith({ user: { id: "user-1", phoneVerified: false } });
    render(<BookButton tripId="t1" seatsAvailable={3} />);
    fireEvent.click(screen.getByText("Забронировать"));
    expect(screen.getByText("Укажите номер телефона")).toBeInTheDocument();
    // The fixed inset-0 overlay div is the backdrop — click it
    const backdrop = screen.getByText("Укажите номер телефона").closest("[class*='fixed']")!;
    fireEvent.click(backdrop);
    expect(screen.queryByText("Укажите номер телефона")).not.toBeInTheDocument();
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
