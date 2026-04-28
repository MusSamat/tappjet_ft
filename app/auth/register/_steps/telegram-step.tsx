"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getTelegramLinkStatus, verifyOtp } from "@/lib/api/auth";
import { otpSchema } from "@/lib/validation/auth";
import { Button, OtpInput, Spinner, type OtpInputHandle } from "@/components/ui";
import type { AuthResult } from "@/lib/api/types";

interface Props {
  phone: string;
  token: string;
  deepLink: string;
  onVerified: (result: AuthResult) => void;
  onBack: () => void;
  onError: (e: unknown) => void;
}

type Phase = "waiting" | "sent";

export function TelegramStep({ phone, token, deepLink, onVerified, onBack, onError }: Props) {
  const t = useTranslations("auth.register");
  const otpRef = useRef<OtpInputHandle>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [code, setCode] = useState("");

  const statusQuery = useQuery({
    queryKey: ["telegram-link-status", token],
    queryFn: () => getTelegramLinkStatus(token),
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "waiting" ? 2000 : false;
    },
    enabled: phase === "waiting",
  });

  useEffect(() => {
    if (statusQuery.data?.status === "sent") setPhase("sent");
    if (statusQuery.data?.status === "expired") onError(new Error("TELEGRAM_LINK_EXPIRED"));
  }, [statusQuery.data?.status, onError]);

  const verifyMutation = useMutation({
    mutationFn: (c: string) => verifyOtp(phone, c),
    onSuccess: onVerified,
    onError: (e) => { otpRef.current?.clear(); onError(e); },
  });

  if (phase === "waiting") {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center">
          <p className="text-[28px]">✈️</p>
          <p className="mt-2 text-[15px] font-bold text-gray-900">{t("telegram_title")}</p>
          <p className="mt-1 text-[13px] text-gray-500">{t("telegram_hint")}</p>
        </div>

        <a href={deepLink} target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="submit" size="lg" className="w-full">
            {t("telegram_open_btn")}
          </Button>
        </a>

        <div className="flex items-center justify-center gap-2 text-[13px] text-gray-400">
          <Spinner size={14} />
          <span>{t("telegram_waiting")}</span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-center text-[13px] font-semibold text-gray-400 hover:text-gray-600"
        >
          {t("change")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = otpSchema.safeParse(code);
        if (!parsed.success) return;
        verifyMutation.mutate(code);
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      <p className="text-body-lg text-gray-700">
        {t("telegram_otp_prompt")}{" "}
        <span className="font-bold text-gray-900">{phone}</span>.{" "}
        <button type="button" onClick={onBack} className="font-bold text-teal-700 hover:text-teal-800">
          {t("change")}
        </button>
      </p>

      <OtpInput
        ref={otpRef}
        length={6}
        autoFocus
        invalid={verifyMutation.isError}
        disabled={verifyMutation.isPending}
        onChange={setCode}
        onComplete={(c) => verifyMutation.mutate(c)}
      />

      <div className="flex items-center justify-end">
        {verifyMutation.isPending && <Spinner size={16} />}
      </div>

      <Button
        type="submit"
        variant="submit"
        size="lg"
        disabled={verifyMutation.isPending || !otpSchema.safeParse(code).success}
      >
        {t("confirm")}
      </Button>
    </form>
  );
}
