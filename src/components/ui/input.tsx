import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// Input row recipe — design-spec §1.7: ink-50 rounded-2xl row, transparent inner
// input, optional leading icon. `bordered` = compact filter variant.

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** "row" (default) = ink-50 pill row; "bordered" = compact bordered (filters) */
  variant?: "row" | "bordered";
  /** leading icon slot (e.g. <Circle className="h-3.5 w-3.5 text-brand-600" />) */
  icon?: ReactNode;
}

const ROW_BARE =
  "flex h-12 w-full rounded-2xl bg-ink-50 px-4 text-[16px] font-800 text-ink-900 outline-none transition-shadow placeholder:font-700 placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger-400 dark:bg-ink-800 dark:text-white";
const BORDERED_BARE =
  "flex h-10 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-[14px] font-800 text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger-400 dark:border-ink-700 dark:bg-ink-900 dark:text-white";

const ROW_WRAP =
  "flex items-center gap-2 rounded-2xl bg-ink-50 px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-brand-500 dark:bg-ink-800";
const BORDERED_WRAP =
  "flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 transition-colors focus-within:border-brand-500 dark:border-ink-700 dark:bg-ink-900";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", variant = "row", icon, ...rest }, ref) => {
    if (!icon) {
      return (
        <input
          ref={ref}
          type={type}
          className={cn(variant === "bordered" ? BORDERED_BARE : ROW_BARE, className)}
          {...rest}
        />
      );
    }
    return (
      <div className={cn(variant === "bordered" ? BORDERED_WRAP : ROW_WRAP, className)}>
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full bg-transparent font-800 text-ink-900 outline-none placeholder:font-700 placeholder:text-ink-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white",
            variant === "bordered" ? "text-[14px]" : "text-[16px]",
          )}
          {...rest}
        />
      </div>
    );
  },
);
Input.displayName = "Input";
