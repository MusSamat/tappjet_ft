"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowRight, UserCheck } from "lucide-react";
import { checkPhone } from "@/lib/api/auth";
import { phoneSchema } from "@/lib/validation/auth";
import { Button, Label, PhoneInput, Spinner } from "@/components/ui";

interface Props {
  phone: string;
  onPhone: (p: string) => void;
  onNext: () => void;
}

export function PhoneStep({ phone, onPhone, onNext }: Props) {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [touched, setTouched] = useState(false);
  const [exists, setExists] = useState(false);
  const parsed = phoneSchema.safeParse(phone);
  const errMsg = touched && !parsed.success ? parsed.error.issues[0]?.message : undefined;

  // Existing phone → no re-registration: send the user to login (password can
  // be changed there via the Telegram-code reset flow).
  const checkMutation = useMutation({
    mutationFn: () => checkPhone(phone),
    onSuccess: (res) => {
      if (res.exists) setExists(true);
      else onNext();
    },
    // Check failed (network etc.) — don't block registration on it.
    onError: () => onNext(),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!parsed.success) return;
        checkMutation.mutate();
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">{t("phone_label")}</Label>
        <PhoneInput
          id="phone"
          value={phone}
          onValueChange={(p) => {
            setExists(false);
            onPhone(p);
          }}
          invalid={Boolean(errMsg)}
          hint={errMsg ?? t("phone_hint")}
        />
      </div>
      {exists ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 dark:bg-ink-900">
          <div className="flex items-start gap-2.5">
            <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" />
            <p className="text-[16px] text-ink-900 dark:text-white">{t("already_registered")}</p>
          </div>
          <Button
            type="button"
            variant="submit"
            size="lg"
            onClick={() => router.push(`/auth/login?phone=${encodeURIComponent(phone)}`)}
          >
            {t("sign_in")}
          </Button>
        </div>
      ) : (
        <Button type="submit" variant="submit" size="lg" disabled={checkMutation.isPending}>
          {checkMutation.isPending ? <Spinner size={18} /> : (
            <>
              {t("continue")}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      )}
    </form>
  );
}
