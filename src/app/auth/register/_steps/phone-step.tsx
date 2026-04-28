"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { initTelegramLink } from "@/lib/api/auth";
import { phoneSchema } from "@/lib/validation/auth";
import { Button, Label, PhoneInput } from "@/components/ui";

interface Props {
  phone: string;
  onPhone: (p: string) => void;
  onNext: (data: { token: string; deepLink: string; expiresInSec: number }) => void;
  onError: (e: unknown) => void;
}

export function PhoneStep({ phone, onPhone, onNext, onError }: Props) {
  const t = useTranslations("auth.register");
  const [touched, setTouched] = useState(false);
  const parsed = phoneSchema.safeParse(phone);
  const errMsg = touched && !parsed.success ? parsed.error.issues[0]?.message : undefined;

  const sendMutation = useMutation({
    mutationFn: (p: string) => initTelegramLink(p),
    onSuccess: onNext,
    onError,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!parsed.success) return;
        sendMutation.mutate(phone);
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">{t("phone_label")}</Label>
        <PhoneInput
          id="phone"
          value={phone}
          onValueChange={onPhone}
          invalid={Boolean(errMsg)}
          hint={errMsg ?? t("phone_hint")}
        />
      </div>
      <Button type="submit" variant="submit" size="lg" disabled={sendMutation.isPending}>
        {sendMutation.isPending ? t("sending") : t("get_code")}
      </Button>
    </form>
  );
}
