import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, rows = 4, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "flex w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-4 py-3 text-body font-bold text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-coral-400",
        className,
      )}
      {...rest}
    />
  ),
);
Textarea.displayName = "Textarea";
