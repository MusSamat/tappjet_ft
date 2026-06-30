"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { changePhone, confirmPhoneChange } from "@/lib/api/profile";
import { useAuth } from "@/store/auth";
import { Button, Label, OtpInput, PasswordInput, PhoneInput, Spinner } from "@/components/ui";
import type { OtpInputHandle } from "@/components/ui/otp-input";
import { useCountdown } from "@/lib/hooks/use-countdown";

type Step = "idle" | "otp";

export function PhoneChangeForm() {
  const updateUser = useAuth((s) => s.updateUser);
  const [step, setStep] = useState<Step>("idle");
  const [newPhone, setNewPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const otpRef = useRef<OtpInputHandle>(null);
  const { remaining, reset: startCountdown } = useCountdown(0);
  const counting = remaining > 0;

  const sendMutation = useMutation({
    mutationFn: () =>
      changePhone(newPhone, { provider: "phone", password }),
    onSuccess: () => {
      setStep("otp");
      startCountdown(60);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmPhoneChange(newPhone, otp),
    onSuccess: (updated) => {
      updateUser({ phone: updated.phone });
      setStep("idle");
      setNewPhone("");
      setPassword("");
      setOtp("");
    },
    onError: () => {
      otpRef.current?.clear();
      setOtp("");
    },
  });

  if (step === "otp") {
    return (
      <div className="space-y-4">
        <p className="text-body-lg text-ink-700">
          Введите код из SMS на номер{" "}
          <span className="font-semibold text-ink-900">{newPhone}</span>
        </p>
        <div>
          <Label>Код из SMS</Label>
          <OtpInput
            ref={otpRef}
            length={6}
            onChange={setOtp}
            className="mt-2"
          />
        </div>
        {confirmMutation.error && (
          <p className="text-caption text-coral-500">Неверный код. Попробуйте ещё раз.</p>
        )}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            disabled={otp.length !== 6 || confirmMutation.isPending}
            onClick={() => confirmMutation.mutate()}
          >
            {confirmMutation.isPending ? <Spinner size={16} /> : "Подтвердить"}
          </Button>
          <Button
            variant="ghost"
            size="md"
            disabled={counting}
            onClick={() => {
              sendMutation.mutate();
              startCountdown(60);
            }}
          >
            {counting ? `Повтор через ${remaining} с` : "Отправить снова"}
          </Button>
        </div>
        <button
          type="button"
          className="text-caption text-ink-500 underline"
          onClick={() => setStep("idle")}
        >
          Изменить номер
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Новый номер телефона</Label>
        <PhoneInput value={newPhone} onValueChange={setNewPhone} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="phone-change-password">Текущий пароль (для подтверждения)</Label>
        <PasswordInput
          id="phone-change-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1"
          autoComplete="current-password"
        />
      </div>
      {sendMutation.error && (
        <p className="text-caption text-coral-500">Неверный пароль или номер уже занят.</p>
      )}
      <Button
        variant="primary"
        size="md"
        disabled={newPhone.length < 10 || !password || sendMutation.isPending}
        onClick={() => sendMutation.mutate()}
      >
        {sendMutation.isPending ? <Spinner size={16} /> : "Получить SMS"}
      </Button>
    </div>
  );
}
