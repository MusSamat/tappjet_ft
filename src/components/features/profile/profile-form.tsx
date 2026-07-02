"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/lib/api/auth";
import { useAuth } from "@/store/auth";
import { toastSuccess } from "@/components/layout/quick-toast";
import { Button, Input, Label, Spinner } from "@/components/ui";

const schema = z.object({
  name: z.string().min(2).max(50),
  language: z.enum(["ru", "kg"]),
});
type FormData = z.infer<typeof schema>;

export function ProfileForm() {
  const t = useTranslations("profile_forms");
  const tLocale = useTranslations("locale");
  const tToasts = useTranslations("toasts");
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      language: (user?.language as "ru" | "kg") ?? "ru",
    },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormData) => updateProfile(data),
    onSuccess: (updated) => {
      updateUser({ name: updated.name });
      toastSuccess(tToasts("profile_saved"));
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <div>
        <Label htmlFor="name">{t("name_label")}</Label>
        <Input id="name" {...register("name")} className="mt-1" />
        {errors.name && <p className="mt-1 text-caption text-coral-500">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="language">{t("language_label")}</Label>
        <select
          id="language"
          {...register("language")}
          className="mt-1 h-12 w-full rounded-2xl border-2 border-ink-200 bg-white px-4 text-body-lg text-ink-900 outline-none focus:border-brand-500"
        >
          <option value="ru">{tLocale("ru")}</option>
          <option value="kg">{tLocale("kg")}</option>
        </select>
      </div>

      {error && (
        <p className="text-caption text-coral-500">{t("save_error")}</p>
      )}

      <Button type="submit" variant="primary" size="md" disabled={!isDirty || isPending}>
        {isPending ? <Spinner size={16} /> : t("save")}
      </Button>
    </form>
  );
}
