"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { phoneSchema } from "@/lib/validation/auth";
import { Button, Label, PhoneInput } from "@/components/ui";

interface Props {
  phone: string;
  onPhone: (p: string) => void;
  onNext: () => void;
}

export function PhoneStep({ phone, onPhone, onNext }: Props) {
  const t = useTranslations("auth.register");
  const [touched, setTouched] = useState(false);
  const parsed = phoneSchema.safeParse(phone);
  const errMsg = touched && !parsed.success ? parsed.error.issues[0]?.message : undefined;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!parsed.success) return;
        onNext();
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
      <Button type="submit" variant="submit" size="lg">
        {t("continue")}
        <ArrowRight className="h-5 w-5" />
      </Button>
    </form>
  );
}
