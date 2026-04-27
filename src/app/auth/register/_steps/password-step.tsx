"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { setPassword } from "@/lib/api/auth";
import { passwordSchema } from "@/lib/validation/auth";
import { Button, Label, NotifCard, PasswordInput } from "@/components/ui";

interface Props {
  onDone: () => void;
  onSkip: () => void;
  onError: (e: unknown) => void;
}

export function PasswordStep({ onDone, onSkip, onError }: Props) {
  const t = useTranslations("auth.register");
  const [password, setPasswordValue] = useState("");
  const [touched, setTouched] = useState(false);
  const parsed = passwordSchema.safeParse(password);
  const errMsg = touched && !parsed.success ? parsed.error.issues[0]?.message : undefined;

  const mutation = useMutation({
    mutationFn: () => setPassword(password),
    onSuccess: onDone,
    onError,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!parsed.success) return;
        mutation.mutate();
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <NotifCard variant="info" title={t("password_info_title")}>
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {t("password_info_desc")}
        </span>
      </NotifCard>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("password_label")}</Label>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPasswordValue(e.target.value)}
          placeholder={t("password_placeholder")}
          autoComplete="new-password"
          invalid={Boolean(errMsg)}
        />
        {errMsg && <span className="text-caption text-error">{errMsg}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <Button type="submit" variant="submit" size="lg" disabled={mutation.isPending || !parsed.success}>
          {mutation.isPending ? t("saving") : t("done")}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onSkip}>
          {t("skip")}
        </Button>
      </div>
    </form>
  );
}
