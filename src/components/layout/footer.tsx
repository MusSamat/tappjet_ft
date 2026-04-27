"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const year = new Date().getFullYear();

  const LINKS = {
    product: [
      { href: "/trips",           label: t("find_trip") },
      { href: "/trips/create",    label: t("publish_trip") },
      { href: "/profile/driver",  label: t("become_driver") },
    ],
    company: [
      { href: "/about",    label: t("about") },
      { href: "/privacy",  label: t("privacy") },
      { href: "/terms",    label: t("terms") },
    ],
    support: [
      { href: "https://t.me/tappjet_support", label: t("telegram_support"), external: true },
      { href: "/complaint", label: t("complaint") },
    ],
  };

  if (pathname.startsWith("/trips")) return null;
  if (pathname.includes("/chat")) return null;

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="container grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="text-h2 font-extrabold text-teal-600">
            Tappjet
          </Link>
          <p className="mt-2 text-caption text-gray-500">
            {t("tagline")}
          </p>
        </div>

        <FooterColumn title={t("product")} items={LINKS.product} />
        <FooterColumn title={t("company")} items={LINKS.company} />
        <FooterColumn title={t("support")} items={LINKS.support} />
      </div>
      <div className="border-t border-gray-100">
        <div className="container flex flex-col items-start justify-between gap-2 py-4 text-caption text-gray-500 md:flex-row md:items-center">
          <span>© {year} Tappjet</span>
          <span>{t("made_in")}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: Array<{ href: string; label: string; external?: boolean }>;
}) {
  return (
    <div>
      <h3 className="text-caption font-bold uppercase tracking-wider text-gray-500">{title}</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.href}>
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body text-gray-700 hover:text-teal-700"
              >
                {item.label}
              </a>
            ) : (
              <Link href={item.href} className="text-body text-gray-700 hover:text-teal-700">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
