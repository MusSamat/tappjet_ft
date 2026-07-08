"use client";

import { useTranslations } from "next-intl";

type UserShape = {
  phoneVerified?: boolean;
  name?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  telegramLinked?: boolean;
} | null;

export function ProfileCompletion({ user, isDriver }: { user: UserShape; isDriver: boolean }) {
  const t = useTranslations("profile");
  const steps = [
    { done: !!user?.phoneVerified, label: t("completion_phone"), pct: 20 },
    { done: !!user?.name, label: t("completion_name"), pct: 20 },
    { done: !!user?.avatarUrl, label: t("completion_avatar"), pct: 20, hint: t("completion_hint", { pct: 20 }) },
    { done: !!(user as { bio?: string | null } | null)?.bio, label: t("completion_bio"), pct: 20, hint: t("completion_hint", { pct: 20 }) },
    { done: isDriver, label: t("completion_driver"), pct: 20, hint: t("completion_hint", { pct: 20 }) },
  ];
  const pct = steps.reduce((s, step) => s + (step.done ? step.pct : 0), 0);
  if (pct === 100) return null;

  return (
    <div className="rounded-2xl border border-accent-200 bg-accent-50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[15px] font-extrabold text-ink-900">{t("completion_title", { pct })}</p>
        <span className="text-[14px] font-bold text-accent-700">{pct}%</span>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-accent-100">
        <div
          className="h-full rounded-full bg-accent-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-2 text-[14px]">
            <span className={step.done ? "text-brand-600" : "text-ink-300"}>
              {step.done ? "✓" : "○"}
            </span>
            <span className={step.done ? "text-ink-500 line-through" : "font-semibold text-ink-700"}>
              {step.label}
            </span>
            {!step.done && step.hint && (
              <span className="rounded-full bg-accent-100 px-1.5 py-0.5 text-[11px] font-bold text-accent-700">
                {step.hint}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
