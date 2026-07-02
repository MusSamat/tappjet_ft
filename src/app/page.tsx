import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { OnboardingGate } from "@/components/features/onboarding/onboarding-gate";
import { HeroSection } from "@/components/features/home/hero-section";
import { BecomeDriverCta } from "@/components/features/home/become-driver-cta";
import { getPopularRoutes } from "@/lib/api/cities";

export default async function HomePage() {
  const t = await getTranslations("landing");
  const popularRoutes = await getPopularRoutes().catch(() => []);

  return (
    <>
      <OnboardingGate />

      {/* ===== HERO — search-first for guest/passenger, publish-first for driver ===== */}
      <HeroSection />

      {/* ===== POPULAR ROUTES ===== */}
      <section className="mx-auto max-w-[1200px] px-4 py-8 sm:py-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-extrabold text-ink-900 sm:text-[24px]">{t("popular_routes")}</h2>
          <Link
            href="/trips"
            className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-3.5 py-2 text-[13px] font-extrabold text-ink-700 hover:bg-ink-200"
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
              className="group rounded-3xl bg-white p-4 shadow-card ring-1 ring-ink-100 transition-all hover:ring-brand-300"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-extrabold text-ink-900">{r.from}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-ink-400" aria-hidden={true} />
                  <span className="text-[15px] font-extrabold text-ink-900">{r.to}</span>
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <ArrowRight className="h-4 w-4" aria-hidden={true} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-ink-500">
                  {r.tripCount > 0 ? t("active_trips", { n: r.tripCount }) : t("no_trips")}
                </span>
                {r.minPrice && (
                  <span className="text-[13px] font-extrabold text-brand-700">{t("from_price", { n: r.minPrice })}</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA banners */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-[2fr_1fr]">
          {/* Become a driver */}
          <BecomeDriverCta />

          {/* Safety */}
          <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <ShieldCheck className="h-6 w-6" aria-hidden={true} />
            </span>
            <h3 className="mt-3 text-[17px] font-extrabold text-ink-900">{t("safety_title")}</h3>
            <p className="mt-2 text-[13px] font-semibold leading-relaxed text-ink-500">
              {t("safety_desc")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
