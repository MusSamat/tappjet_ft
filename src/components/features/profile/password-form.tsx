"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { setPassword } from "@/lib/api/auth";
import { extractError } from "@/lib/api/client";
import { Button, Label, PasswordInput, Spinner } from "@/components/ui";

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function PasswordForm() {
  const t = useTranslations("password_form");

  const schema = z
    .object({
      // Required — the change-password UI is for users who already have one.
      // A blank field used to reach the backend and come back as a misleading
      // "wrong current password"; now it's a clear field error before submit.
      currentPassword: z.string().min(1, t("current_required")),
      newPassword: z.string().min(8, t("min_length")).regex(/\d/, t("needs_digit")),
      confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: t("mismatch"),
      path: ["confirmPassword"],
    });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (d: FormData) => setPassword(d.newPassword, d.currentPassword),
    onSuccess: () => reset(),
  });

  // Distinguish the two backend reasons instead of always saying "wrong current".
  const reason = error ? extractError(error).details?.reason : undefined;
  const serverError =
    reason === "current_password_required"
      ? t("current_required")
      : error
        ? t("wrong_current")
        : null;

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">{t("current_label")}</Label>
        <PasswordInput id="currentPassword" {...register("currentPassword")} className="mt-1" />
        {errors.currentPassword && (
          <p className="mt-1 text-caption text-coral-500">{errors.currentPassword.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="newPassword">{t("new_label")}</Label>
        <PasswordInput id="newPassword" {...register("newPassword")} className="mt-1" />
        {errors.newPassword && (
          <p className="mt-1 text-caption text-coral-500">{errors.newPassword.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="confirmPassword">{t("repeat_label")}</Label>
        <PasswordInput id="confirmPassword" {...register("confirmPassword")} className="mt-1" />
        {errors.confirmPassword && (
          <p className="mt-1 text-caption text-coral-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {serverError && <p className="text-caption text-coral-500">{serverError}</p>}
      {isSuccess && <p className="text-caption text-brand-700">{t("success")}</p>}

      <Button type="submit" variant="primary" size="md" disabled={isPending}>
        {isPending ? <Spinner size={16} /> : t("title")}
      </Button>
    </form>
  );
}
