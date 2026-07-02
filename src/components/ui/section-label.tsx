import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface SectionLabelProps {
  children: ReactNode;
  /** "sm" (default, 11px) | "xs" (10px — desktop filter sidebars) */
  size?: "sm" | "xs";
  className?: string;
}

/** Uppercase section label — design-spec §1.7. */
export function SectionLabel({ children, size = "sm", className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "font-900 uppercase tracking-wider text-ink-400",
        size === "xs" ? "text-[10px]" : "text-[11px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** «необязательно» tag next to section labels — design-spec §1.7. */
export function OptionalTag({ className }: { className?: string }) {
  const t = useTranslations("common");
  return (
    <span
      className={cn(
        "rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-800 text-ink-500 dark:bg-ink-800 dark:text-ink-400",
        className,
      )}
    >
      {t("optional")}
    </span>
  );
}
