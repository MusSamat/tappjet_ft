import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RouteEntry } from "@/components/features/search/route-entry";
import { BecomeDriverCta } from "@/components/features/home/become-driver-cta";
import { getPopularRoutes } from "@/lib/api/cities";

export default async function HomePage() {
  const t = await getTranslations("landing");
  const popularRoutes = await getPopularRoutes().catch(() => []);

  return (
    <>
      {/* ===== HERO — route-first search (Yandex «Межгород» pattern); drivers
           get an intent toggle «Ищу поездку / Ищу пассажиров» ===== */}
      <RouteEntry modeSwitchable showPopular={false} />

      {/* ===== POPULAR ROUTES ===== */}
      <section className="mx-auto max-w-[1200px] px-4 py-8 sm:py-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-disp text-[20px] font-900 text-ink-900 dark:text-white sm:text-[24px]">{t("popular_routes")}</h2>
          <Link
            href="/trips"
            className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-3.5 py-2 text-[14px] font-800 text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700"
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
              className="group relative overflow-hidden rounded-3xl bg-white p-4 shadow-card ring-1 ring-ink-100 transition hover:-translate-y-0.5 hover:shadow-lift dark:bg-ink-900 dark:ring-ink-800"
            >
              {/* Ride-card spine motif (design-spec §1.5) */}
              <div className="flex items-center gap-2.5">
                <div className="flex shrink-0 flex-col items-center self-stretch py-1" aria-hidden={true}>
                  <span className="h-2 w-2 shrink-0 rounded-full border-2 border-brand-600" />
                  <span className="my-0.5 w-0.5 flex-1 rounded bg-gradient-to-b from-brand-500 to-accent-400" />
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-900 leading-tight text-ink-900 dark:text-white">{r.from}</p>
                  <p className="my-0.5 text-[13px] font-700 text-ink-400">
                    {r.tripCount > 0 ? t("active_trips", { n: r.tripCount }) : t("no_trips")}
                  </p>
                  <p className="truncate text-[16px] font-900 leading-tight text-ink-900 dark:text-white">{r.to}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 self-stretch">
                  {r.minPrice ? (
                    <span className="text-[14px] font-900 text-brand-700 dark:text-brand-300">{t("from_price", { n: r.minPrice })}</span>
                  ) : (
                    <span aria-hidden={true} />
                  )}
                  <span className="mt-auto flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/15 dark:text-brand-300">
                    <ArrowRight className="h-4 w-4" aria-hidden={true} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA banners */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-[2fr_1fr]">
          {/* Become a driver */}
          <BecomeDriverCta />

          {/* Safety */}
          <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <ShieldCheck className="h-6 w-6" aria-hidden={true} />
            </span>
            <h3 className="mt-3 text-[18px] font-900 text-ink-900 dark:text-white">{t("safety_title")}</h3>
            <p className="mt-2 text-[15px] font-700 leading-relaxed text-ink-500 dark:text-ink-400">
              {t("safety_desc")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
