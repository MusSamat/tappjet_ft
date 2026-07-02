import { getTranslations } from "next-intl/server";
import { Search, MessageCircle, Car, type LucideIcon } from "lucide-react";

type Step = { Icon: LucideIcon; title: string; description: string };

export async function HowItWorks() {
  const t = await getTranslations("how_it_works");

  const STEPS: Step[] = [
    { Icon: Search,        title: t("step1_title"), description: t("step1_desc") },
    { Icon: MessageCircle, title: t("step2_title"), description: t("step2_desc") },
    { Icon: Car,           title: t("step3_title"), description: t("step3_desc") },
  ];

  return (
    <section className="container py-10 md:py-14">
      <h2 className="font-disp text-h1 text-ink-900 dark:text-white">{t("title")}</h2>
      <ol className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {STEPS.map(({ Icon, title, description }, idx) => (
          <li
            key={idx}
            className="relative flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
          >
            <span className="absolute right-4 top-4 font-disp text-h1 font-900 text-ink-100 dark:text-ink-800" aria-hidden="true">
              {idx + 1}
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="text-h2 text-ink-900 dark:text-white">{title}</h3>
            <p className="text-body-lg text-ink-700 dark:text-ink-300">{description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
