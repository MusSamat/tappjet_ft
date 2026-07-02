"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, MessageCircle, Send, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeroSearchForm } from "@/components/features/search/hero-search-form";
import { useAuth } from "@/store/auth";

export function HeroSection() {
  const status = useAuth((s) => s.status);
  const activeMode = useAuth((s) => s.activeMode);
  const isDriver = status === "authenticated" && activeMode === "driver";

  return isDriver ? <DriverHero /> : <SearchHero />;
}

function SearchHero() {
  const t = useTranslations("landing");

  const TRUST_BADGES: { icon: LucideIcon; text: string }[] = [
    { icon: ShieldCheck, text: t("trust_verified") },
    { icon: Star, text: t("trust_ratings") },
    { icon: MessageCircle, text: t("trust_chat") },
    { icon: Send, text: t("trust_tma") },
  ];

  return (
    <section className="bg-gradient-to-b from-brand-50 to-white px-4 pb-8 pt-8 dark:from-ink-900 dark:to-ink-950 sm:pt-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-disp text-[26px] font-900 leading-[1.12] tracking-tight text-ink-900 dark:text-white sm:text-[36px] lg:text-[42px]">
          {t("hero_title1")} <span className="text-brand-700 dark:text-brand-300">{t("hero_title2")}</span> {t("hero_subtitle")}
        </h1>
        <p className="mx-auto mt-2 max-w-[460px] text-[14px] font-600 text-ink-500 dark:text-ink-400 sm:text-[16px]">
          {t("hero_desc")}
        </p>
      </div>

      <HeroSearchForm />

      <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
        {TRUST_BADGES.map(({ icon: Icon, text }) => (
          <span
            key={text}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-800 text-ink-700 shadow-xs ring-1 ring-ink-100 dark:bg-ink-900 dark:text-ink-200 dark:ring-ink-800"
          >
            <Icon className="h-3.5 w-3.5 text-brand-600 dark:text-brand-300" aria-hidden={true} />
            {text}
          </span>
        ))}
      </div>
    </section>
  );
}

function DriverHero() {
  const t = useTranslations("landing");

  return (
    <section className="bg-gradient-to-b from-brand-50 to-white px-4 pb-8 pt-8 dark:from-ink-900 dark:to-ink-950 sm:pt-12">
      <div className="mx-auto max-w-3xl rounded-4xl bg-gradient-to-br from-brand-600 to-brand-500 p-6 text-center shadow-brandcta sm:p-8">
        <h1 className="font-disp text-[24px] font-900 leading-tight text-white sm:text-[32px]">
          {t("driver_hero_title")}
        </h1>
        <p className="mx-auto mt-2 max-w-[420px] text-[14px] font-600 text-white/90 sm:text-[15px]">
          {t("driver_hero_desc")}
        </p>
        <Link
          href="/trips/create"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-accent-500 px-6 py-3 text-[14px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400"
        >
          {t("driver_hero_cta")}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden={true} />
        </Link>
      </div>
    </section>
  );
}
