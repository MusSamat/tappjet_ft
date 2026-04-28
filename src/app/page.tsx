import Link from "next/link";
import { ArrowRight, Shield, Star, MessageCircle, Send, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { HeroSearchForm } from "@/components/features/search/hero-search-form";
import { OnboardingGate } from "@/components/features/onboarding/onboarding-gate";
import { getPopularRoutes } from "@/lib/api/cities";

export default async function HomePage() {
  const t = await getTranslations("landing");
  const popularRoutes = await getPopularRoutes().catch(() => []);

  const TRUST_BADGES: { icon: LucideIcon; text: string }[] = [
    { icon: Shield, text: t("trust_verified") },
    { icon: Star, text: t("trust_ratings") },
    { icon: MessageCircle, text: t("trust_chat") },
    { icon: Send, text: t("trust_tma") },
  ];

  return (
    <>
      <OnboardingGate />
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 to-white px-6 pb-12 pt-14">
        {/* Title */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-[36px] lg:text-[44px]">
            {t("hero_title1")}{" "}
            <span className="text-teal-700">{t("hero_title2")}</span>{" "}
            {t("hero_subtitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-[560px] text-[17px] text-gray-700">
            {t("hero_desc")}
          </p>
        </div>

        {/* Search card */}
        <HeroSearchForm />

        {/* Trust badges */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-6">
          {TRUST_BADGES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="h-[18px] w-[18px] text-teal-600" aria-hidden={true} />
              <span className="text-[13px] font-bold text-gray-900">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== POPULAR ROUTES ===== */}
      <section className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h1 text-gray-900">{t("popular_routes")}</h2>
          <Link
            href="/trips"
            className="flex items-center gap-1 rounded-[10px] bg-gray-100 px-3.5 py-2 text-[13px] font-bold text-gray-700 hover:bg-gray-200"
          >
            {t("all_routes")}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden={true} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularRoutes.map((r) => (
            <Link
              key={`${r.from}-${r.to}`}
              href={`/trips?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`}
              className="group rounded-[14px] border-[0.5px] border-gray-300 bg-white p-4 transition-all hover:border-teal-400 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-extrabold text-gray-900">{r.from}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400" aria-hidden={true} />
                  <span className="text-[15px] font-extrabold text-gray-900">{r.to}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600" aria-hidden={true} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-gray-500">
                  {r.tripCount > 0 ? t("active_trips", { n: r.tripCount }) : t("no_trips")}
                </span>
                {r.minPrice && (
                  <span className="text-[12px] font-bold text-teal-700">{t("from_price", { n: r.minPrice })}</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA banners */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-[2fr_1fr]">
          {/* Become a driver */}
          <div className="rounded-[20px] bg-gradient-to-br from-teal-700 to-teal-600 p-6">
            <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-white/80">
              {t("driver_cta_label")}
            </p>
            <h3 className="mt-2 text-[28px] font-extrabold leading-tight text-white">
              {t("driver_cta_title")}
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-white/90">
              {t("driver_cta_desc")}
            </p>
            <Link
              href="/profile/driver"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-[14px] font-bold text-[#4A2C00] hover:bg-amber-600"
            >
              {t("driver_cta_btn")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden={true} />
            </Link>
          </div>

          {/* Safety */}
          <div className="rounded-[20px] border-[0.5px] border-gray-300 bg-white p-6 shadow-sm">
            <Shield className="h-6 w-6 text-teal-600" aria-hidden={true} />
            <h3 className="mt-2 text-h2 text-gray-900">{t("safety_title")}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-700">
              {t("safety_desc")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
