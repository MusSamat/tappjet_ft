"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { setPassword } from "@/lib/api/auth";
import { Button, Label, PasswordInput, Spinner } from "@/components/ui";

type FormData = {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
};

export function PasswordForm() {
  const t = useTranslations("password_form");

  const schema = z
    .object({
      currentPassword: z.string().optional(),
      newPassword: z
        .string()
        .min(8, t("min_length"))
        .regex(/\d/, t("needs_digit")),
      confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: t("mismatch"),
      path: ["confirmPassword"],
    });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (d: FormData) => setPassword(d.newPassword, d.currentPassword || undefined),
    onSuccess: () => reset(),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">{t("current_label")}</Label>
        <PasswordInput id="currentPassword" {...register("currentPassword")} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="newPassword">{t("new_label")}</Label>
        <PasswordInput id="newPassword" {...register("newPassword")} className="mt-1" />
        {errors.newPassword && (
          <p className="mt-1 text-caption text-error">{errors.newPassword.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="confirmPassword">{t("repeat_label")}</Label>
        <PasswordInput id="confirmPassword" {...register("confirmPassword")} className="mt-1" />
        {errors.confirmPassword && (
          <p className="mt-1 text-caption text-error">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && <p className="text-caption text-error">{t("wrong_current")}</p>}
      {isSuccess && <p className="text-caption text-teal-700">{t("success")}</p>}

      <Button type="submit" variant="primary" size="md" disabled={isPending}>
        {isPending ? <Spinner size={16} /> : t("title")}
      </Button>
    </form>
  );
}
