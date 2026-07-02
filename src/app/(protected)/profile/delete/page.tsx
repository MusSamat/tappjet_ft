"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteAccount } from "@/lib/api/profile";
import { useAuth } from "@/store/auth";
import { Button, Input, Label, Spinner } from "@/components/ui";

export default function ProfileDeletePage() {
  const t = useTranslations("delete_account");
  const router = useRouter();
  const clearSession = useAuth((s) => s.clearSession);
  const [phrase, setPhrase] = useState("");

  const confirmPhrase = t("confirm_phrase");

  const { mutate, isPending, error } = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      clearSession();
      router.replace("/");
    },
  });

  return (
    <div className="container max-w-lg py-10">
      <div className="rounded-4xl border border-danger-200 bg-white p-6 shadow-card dark:border-danger-500/30 dark:bg-ink-900">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-danger-100 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-disp text-h1 text-ink-900 dark:text-white">{t("title")}</h1>
            <p className="mt-2 text-body-lg text-ink-700 dark:text-ink-300">
              {t("warning")}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="confirm-phrase">
              {t("confirm_label", { phrase: confirmPhrase })}
            </Label>
            <Input
              id="confirm-phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder={confirmPhrase}
              className="mt-1"
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-caption text-danger-600 dark:text-danger-400">
              {t("error")}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="danger"
              size="md"
              disabled={phrase !== confirmPhrase || isPending}
              onClick={() => mutate()}
            >
              {isPending ? <Spinner size={16} /> : t("delete_btn")}
            </Button>
            <Button variant="ghost" size="md" onClick={() => router.back()}>
              {t("cancel_btn")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
