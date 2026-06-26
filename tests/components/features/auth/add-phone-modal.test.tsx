import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddPhoneModal } from "@/components/features/auth/add-phone-modal";
import { useAuth } from "@/store/auth";
import { sendOtp, confirmPhoneAdd } from "@/lib/api/auth";

vi.mock("@/store/auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  initTelegramLink: vi.fn(),
  getTelegramLinkStatus: vi.fn(),
  sendOtp: vi.fn(),
  confirmPhoneAdd: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  extractError: vi.fn((e: unknown) => e),
}));

vi.mock("@/lib/utils/api-error", () => ({
  friendlyError: vi.fn((e: unknown) => String((e as any)?.message ?? e)),
}));

const setSession = vi.fn();

// Non-telegram user → SMS-OTP path (the branch that lost coverage in BookButton).
function mockAuth(telegramLinked = false) {
  const store = { user: { id: "user-1", telegramLinked }, setSession };
  vi.mocked(useAuth).mockImplementation((selector: any) => selector(store));
}

async function fillPhoneAndRequestCode() {
  fireEvent.change(screen.getByPlaceholderText("XXX XX XX XX"), {
    target: { value: "700000000" },
  });
  fireEvent.click(screen.getByText("Получить код"));
  await waitFor(() => screen.getByText("Введите код подтверждения"));
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth(false);
  vi.mocked(sendOtp).mockResolvedValue({ expiresInSec: 120 } as any);
  vi.mocked(confirmPhoneAdd).mockResolvedValue({
    accessToken: "tok",
    user: { id: "user-1" },
  } as any);
});

describe("AddPhoneModal", () => {
  it("renders the phone step when open", () => {
    render(<AddPhoneModal open onClose={vi.fn()} />);
    expect(screen.getByText("Добавьте номер телефона")).toBeInTheDocument();
  });

  it("sends OTP and advances to the code step", async () => {
    render(<AddPhoneModal open onClose={vi.fn()} />);
    await fillPhoneAndRequestCode();
    expect(vi.mocked(sendOtp)).toHaveBeenCalledWith("+996700000000");
  });

  it("keeps Подтвердить disabled below 6 digits and enables it at 6", async () => {
    render(<AddPhoneModal open onClose={vi.fn()} />);
    await fillPhoneAndRequestCode();
    const otp = screen.getByPlaceholderText("— — — — — —");
    fireEvent.change(otp, { target: { value: "1234" } });
    expect(screen.getByText("Подтвердить").closest("button")).toBeDisabled();
    fireEvent.change(otp, { target: { value: "123456" } });
    expect(screen.getByText("Подтвердить").closest("button")).not.toBeDisabled();
  });

  it("confirms the code, updates the session and fires onDone/onClose", async () => {
    const onDone = vi.fn();
    const onClose = vi.fn();
    render(<AddPhoneModal open onClose={onClose} onDone={onDone} />);
    await fillPhoneAndRequestCode();
    fireEvent.change(screen.getByPlaceholderText("— — — — — —"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByText("Подтвердить"));
    await waitFor(() => {
      expect(vi.mocked(confirmPhoneAdd)).toHaveBeenCalledWith("+996700000000", "123456");
      expect(setSession).toHaveBeenCalledWith({ accessToken: "tok", user: { id: "user-1" } });
      expect(onDone).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("shows a friendly error when sending the code fails", async () => {
    vi.mocked(sendOtp).mockRejectedValueOnce({ message: "Слишком много запросов" });
    render(<AddPhoneModal open onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("XXX XX XX XX"), {
      target: { value: "700000000" },
    });
    fireEvent.click(screen.getByText("Получить код"));
    await waitFor(() => {
      expect(screen.getByText("Слишком много запросов")).toBeInTheDocument();
    });
  });
});
