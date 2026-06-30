"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

export function PassengerEmptyState({ subTab }: { subTab: "active" | "history" }) {
  const t = useTranslations("bookings");
  if (subTab === "history") {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
        <p className="text-[17px] font-bold text-ink-900">{t("empty_history")}</p>
        <p className="mt-2 text-[13px] text-ink-500">{t("history_hint")}</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
      <p className="text-[17px] font-bold text-ink-900">{t("no_active_trips")}</p>
      <p className="mt-2 text-[13px] text-ink-500">{t("no_active_hint")}</p>
      <Link href="/trips">
        <button
          type="button"
          className="mt-4 rounded-2xl bg-brand-600 px-6 py-2.5 text-[13px] font-bold text-white hover:bg-brand-700"
        >
          {t("find_trip_btn")}
        </button>
      </Link>
    </div>
  );
}

export function DriverEmptyState({ subTab }: { subTab: "active" | "history" }) {
  const t = useTranslations("bookings");
  if (subTab === "history") {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
        <p className="text-[17px] font-bold text-ink-900">{t("no_trip_history")}</p>
        <p className="mt-2 text-[13px] text-ink-500">{t("history_hint")}</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
      <p className="text-[17px] font-bold text-ink-900">{t("no_published_trips")}</p>
      <p className="mt-2 text-[13px] text-ink-500">{t("no_published_hint")}</p>
      <Link href="/trips/create">
        <button
          type="button"
          className="mt-4 mx-auto flex items-center gap-2 rounded-2xl bg-accent-500 px-6 py-2.5 text-[13px] font-bold text-[#4A2C00] hover:bg-accent-600"
        >
          <Plus className="h-4 w-4" />
          {t("publish_btn")}
        </button>
      </Link>
    </div>
  );
}

export function RequestsEmptyState() {
  const t = useTranslations("bookings");
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
      <p className="text-[17px] font-bold text-ink-900">{t("no_requests_label")}</p>
      <p className="mt-2 text-[13px] text-ink-500">{t("requests_hint")}</p>
    </div>
  );
}
