"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/store/auth";

export function BecomeDriverCta() {
  const user = useAuth((s) => s.user);
  const isDriver = user?.roles?.includes("driver") ?? false;
  const t = useTranslations("landing");

  if (isDriver) return null;

  return (
    <div className="rounded-4xl bg-gradient-to-r from-brand-600 to-brand-500 p-6 shadow-brandcta">
      <p className="text-[12px] font-900 uppercase tracking-wider text-white/80">
        {t("driver_cta_label")}
      </p>
      <h3 className="mt-2 font-disp text-[24px] font-900 leading-tight text-white sm:text-[28px]">
        {t("driver_cta_title")}
      </h3>
      <p className="mt-3 text-[15px] font-700 leading-relaxed text-white/90">
        {t("driver_cta_desc")}
      </p>
      <Link
        href="/profile/driver"
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-accent-500 px-6 py-3 text-[15px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400"
      >
        {t("driver_cta_btn")}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden={true} />
      </Link>
    </div>
  );
}
