"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function BackButton({ label }: { label?: string }) {
  const router = useRouter();
  const t = useTranslations("common");
  label = label ?? t("back");
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-4 inline-flex items-center gap-1 text-[13px] font-bold text-ink-600 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
