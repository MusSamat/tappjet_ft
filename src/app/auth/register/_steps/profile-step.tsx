"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/lib/api/auth";
import { nameSchema, languageSchema } from "@/lib/validation/auth";
import { Button, Checkbox, Input, Label } from "@/components/ui";

interface Props {
  onSaved: (patch: { name: string; language: "ru" | "kg" }) => void;
  onError: (e: unknown) => void;
}

export function ProfileStep({ onSaved, onError }: Props) {
  const t = useTranslations("auth.register");
  const tLocale = useTranslations("locale");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<"ru" | "kg">("ru");
  const [terms, setTerms] = useState(false);
  const [touched, setTouched] = useState(false);

  const nameParse = nameSchema.safeParse(name);
  const nameErr = touched && !nameParse.success ? nameParse.error.issues[0]?.message : undefined;

  const mutation = useMutation({
    mutationFn: () => updateProfile({ name: name.trim(), language, termsAccepted: true }),
    onSuccess: () => onSaved({ name: name.trim(), language }),
    onError,
  });

  const canSubmit = nameParse.success && terms && !mutation.isPending;

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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("name_label")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Асан"
          aria-invalid={Boolean(nameErr) || undefined}
        />
        {nameErr && <span className="text-caption text-coral-500">{nameErr}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="language">{t("lang_label")}</Label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(languageSchema.parse(e.target.value))}
          className="flex h-12 w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-4 text-body-lg font-bold text-ink-900 outline-none focus:border-brand-500 focus:bg-white"
        >
          <option value="ru">{tLocale("ru")}</option>
          <option value="kg">{tLocale("kg")}</option>
        </select>
      </div>

      <label className="flex items-start gap-2">
        <Checkbox id="terms" checked={terms} onCheckedChange={(v) => setTerms(v === true)} />
        <span className="text-body-lg text-ink-700">
          {t("terms_prefix")}{" "}
          <Link href="/terms" className="font-bold text-brand-700 hover:text-brand-800">
            {t("terms_link")}
          </Link>{" "}
          {t("terms_and")}{" "}
          <Link href="/privacy" className="font-bold text-brand-700 hover:text-brand-800">
            {t("privacy_link")}
          </Link>
        </span>
      </label>

      <Button type="submit" variant="submit" size="lg" disabled={!canSubmit}>
        {mutation.isPending ? t("saving") : t("continue")}
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Button>
    </form>
  );
}
