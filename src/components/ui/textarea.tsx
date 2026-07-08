import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, rows = 4, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "flex w-full resize-none rounded-2xl bg-ink-50 px-4 py-3 text-[15px] font-600 text-ink-900 outline-none transition-shadow placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger-400 dark:bg-ink-800 dark:text-white",
        className,
      )}
      {...rest}
    />
  ),
);
Textarea.displayName = "Textarea";
