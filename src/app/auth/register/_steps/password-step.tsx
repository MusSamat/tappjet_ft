"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { setPassword } from "@/lib/api/auth";
import { passwordSchema } from "@/lib/validation/auth";
import { Button, PasswordInput } from "@/components/ui";

interface Props {
  onDone: () => void;
  onSkip: () => void;
  onError: (e: unknown) => void;
}

export function PasswordStep({ onDone, onSkip, onError }: Props) {
  const t = useTranslations("auth.register");
  const [password, setPasswordValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const parsed = passwordSchema.safeParse(password);
  const errMsg = touched && !parsed.success ? parsed.error.issues[0]?.message : undefined;
  const mismatch = confirm.length > 0 && confirm !== password;

  const mutation = useMutation({
    mutationFn: () => setPassword(password),
    onSuccess: onDone,
    onError,
  });

  const canSubmit = parsed.success && confirm === password && !mutation.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!canSubmit) return;
        mutation.mutate();
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex items-start gap-3 rounded-2xl bg-sky-100 p-3 text-sky-600">
        <Info className="h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="text-[12px] font-800">{t("password_info_desc")}</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-[11px] font-900 uppercase tracking-wider text-ink-400">
          {t("password_label")}
        </label>
        <PasswordInput
          id="password"
          className="rounded-2xl border-2 border-ink-200 bg-ink-50 px-4 py-3 pr-10 text-[15px] font-800"
          value={password}
          onChange={(e) => setPasswordValue(e.target.value)}
          placeholder={t("password_placeholder")}
          autoComplete="new-password"
          invalid={Boolean(errMsg)}
        />
        {errMsg && <span className="text-caption text-coral-500">{errMsg}</span>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-[11px] font-900 uppercase tracking-wider text-ink-400">
          {t("confirm_password_label")}
        </label>
        <PasswordInput
          id="confirm"
          className="rounded-2xl border-2 border-ink-200 bg-ink-50 px-4 py-3 text-[15px] font-800"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t("confirm_password_placeholder")}
          autoComplete="new-password"
          invalid={mismatch}
        />
        {mismatch && <span className="text-caption text-coral-500">{t("passwords_mismatch")}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          variant="submit"
          size="lg"
          className="text-[15px]"
          disabled={mutation.isPending || !canSubmit}
        >
          {mutation.isPending ? t("saving") : t("done")}
        </Button>
        <Button type="button" variant="ghost" size="lg" className="text-[13px] font-800 text-ink-400" onClick={onSkip}>
          {t("skip")}
        </Button>
      </div>
    </form>
  );
}
