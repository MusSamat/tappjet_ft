"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui";
import { saveDeferredAction } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { sendOtp, confirmPhoneAdd } from "@/lib/api/auth";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";

interface Props {
  tripId: string;
  seatsAvailable: number;
  driverId?: string;
  disabled?: boolean;
}

type PhoneStep = "phone" | "otp";

export function BookButton({ tripId, seatsAvailable, driverId, disabled }: Props) {
  const router = useRouter();
  const authStatus = useAuth((s) => s.status);
  const me = useAuth((s) => s.user);
  const setSession = useAuth((s) => s.setSession);
  const [seats, setSeats] = useState(1);

  // Phone verification modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const isOwnTrip = !!driverId && driverId === me?.id;
  const soldOut = seatsAvailable <= 0;
  const max = Math.min(4, Math.max(1, seatsAvailable));

  function proceedToBooking() {
    router.push(`/trips/${tripId}/book?seats=${seats}`);
  }

  const handleClick = () => {
    if (authStatus !== "authenticated") {
      saveDeferredAction({ action: "book_trip", trip_id: tripId, seats });
      router.push("/auth/login");
      return;
    }
    // If phone is not verified, show modal first
    if (!me?.phoneVerified) {
      setShowPhoneModal(true);
      setPhoneStep("phone");
      setPhoneError(null);
      return;
    }
    proceedToBooking();
  };

  async function handleSendOtp() {
    if (!phoneInput.trim()) return;
    setPhoneLoading(true);
    setPhoneError(null);
    try {
      const { expiresInSec } = await sendOtp(phoneInput.trim());
      setOtpTimer(expiresInSec);
      setPhoneStep("otp");
    } catch (e) {
      setPhoneError(friendlyError(extractError(e)));
    } finally {
      setPhoneLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otpInput.length < 6) return;
    setPhoneLoading(true);
    setPhoneError(null);
    try {
      const result = await confirmPhoneAdd(phoneInput.trim(), otpInput.trim());
      setSession(result);
      setShowPhoneModal(false);
      proceedToBooking();
    } catch (e) {
      setPhoneError(friendlyError(extractError(e)));
    } finally {
      setPhoneLoading(false);
    }
  }

  // While auth is bootstrapping, don't flash the booking form then switch to "own trip"
  if (authStatus === "idle" || authStatus === "loading") {
    return <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />;
  }

  if (isOwnTrip) {
    return (
      <div className="rounded-2xl border-[0.5px] border-teal-200 bg-teal-50 p-4 text-center">
        <p className="text-body font-bold text-teal-700">Это ваша поездка</p>
        <p className="mt-1 text-caption text-teal-600">Вы водитель этого маршрута</p>
      </div>
    );
  }

  if (soldOut) {
    return (
      <div className="rounded-2xl border-[0.5px] border-gray-300 bg-gray-50 p-4 text-center">
        <p className="text-body font-bold text-gray-700">Мест больше нет</p>
        <p className="mt-1 text-caption text-gray-500">Попробуйте другую поездку</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between rounded-2xl border-[0.5px] border-gray-300 bg-white p-4">
          <span className="text-body font-bold text-gray-900">Количество мест</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              aria-label="Меньше мест"
              disabled={seats <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-h2 text-gray-900 hover:bg-gray-100 disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-[24px] text-center text-h2 font-extrabold">{seats}</span>
            <button
              type="button"
              onClick={() => setSeats((s) => Math.min(max, s + 1))}
              aria-label="Больше мест"
              disabled={seats >= max}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-h2 text-gray-900 hover:bg-gray-100 disabled:opacity-40"
            >
              +
            </button>
          </div>
        </label>

        <Button type="button" variant="submit" size="lg" onClick={handleClick} disabled={disabled}>
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Забронировать
        </Button>
      </div>

      {/* Phone verification modal */}
      {showPhoneModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPhoneModal(false); }}
        >
          <div className="w-full max-w-[420px] rounded-t-[24px] bg-white px-6 py-8 sm:rounded-[24px]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                {phoneStep === "phone" ? (
                  <Phone className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Shield className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div>
                <p className="text-[16px] font-extrabold text-gray-900">
                  {phoneStep === "phone" ? "Укажите номер телефона" : "Введите код из SMS"}
                </p>
                <p className="text-[12px] font-semibold text-gray-500">
                  {phoneStep === "phone"
                    ? "Нужен для связи с водителем после брони"
                    : `Отправили на ${phoneInput}`}
                </p>
              </div>
            </div>

            {phoneError && (
              <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">
                {phoneError}
              </div>
            )}

            {phoneStep === "phone" ? (
              <>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+996 700 000 000"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className="w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-4 py-3 text-[16px] font-semibold text-gray-900 outline-none focus:border-teal-500"
                />
                <Button
                  variant="submit"
                  size="lg"
                  className="mt-3 w-full"
                  disabled={!phoneInput.trim() || phoneLoading}
                  onClick={handleSendOtp}
                >
                  {phoneLoading ? "Отправляем…" : "Получить код"}
                </Button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="_ _ _ _ _ _"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  className="w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-4 py-3 text-center text-[22px] font-extrabold tracking-[0.3em] text-gray-900 outline-none focus:border-teal-500"
                />
                <Button
                  variant="submit"
                  size="lg"
                  className="mt-3 w-full"
                  disabled={otpInput.length < 6 || phoneLoading}
                  onClick={handleVerifyOtp}
                >
                  {phoneLoading ? "Проверяем…" : "Подтвердить"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setPhoneStep("phone"); setOtpInput(""); setPhoneError(null); }}
                  className="mt-2 w-full text-center text-[13px] font-bold text-gray-500 hover:text-gray-700"
                >
                  ← Изменить номер
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
