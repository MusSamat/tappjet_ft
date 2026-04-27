"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

export function SubmittedScreen() {
  const t = useTranslations("driver_reg");
  const router = useRouter();

  const steps = [
    { label: t("step_docs"), active: true },
    { label: t("step_check"), active: false },
    { label: t("step_activate"), active: false },
  ];

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      <div className="rounded-[20px] border-[0.5px] border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
          <Clock className="h-9 w-9 text-amber-500" aria-hidden="true" />
        </div>
        <h2 className="text-[24px] font-extrabold text-gray-900">{t("success_title")}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-gray-500">{t("success_desc")}</p>

        <div className="mx-auto mt-6 max-w-[400px] space-y-2 text-left">
          {steps.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "flex items-center gap-3 rounded-[12px] px-3 py-2.5",
                s.active && "bg-teal-50",
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white",
                  s.active ? "bg-teal-600" : "bg-gray-200",
                )}
              >
                {s.active ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[14px]",
                  s.active ? "font-bold text-gray-900" : "font-medium text-gray-500",
                )}
              >
                {s.label}
              </span>
              {s.active && (
                <span className="ml-auto text-[11px] font-semibold text-gray-400">
                  {t("now")}
                </span>
              )}
            </div>
          ))}
        </div>

        <Button variant="primary" size="md" className="mt-8" onClick={() => router.push("/")}>
          {t("home_btn")}
        </Button>
      </div>
    </div>
  );
}
