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
      <div className="rounded-2xl border-[0.5px] border-red-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-error" aria-hidden="true" />
          <div>
            <h1 className="text-h1 text-gray-900">{t("title")}</h1>
            <p className="mt-2 text-body-lg text-gray-700">
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
            <p className="text-caption text-error">
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
