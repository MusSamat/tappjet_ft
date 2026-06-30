import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-display text-brand-600">404</p>
      <h1 className="mt-2 text-h1 text-ink-900">{t("not_found")}</h1>
      <Link href="/" className="mt-6">
        <Button variant="primary" size="lg">
          {t("home")}
        </Button>
      </Link>
    </div>
  );
}
