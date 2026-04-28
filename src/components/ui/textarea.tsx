import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, rows = 4, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "flex w-full rounded-xl border-[1.5px] border-gray-300 bg-white px-4 py-3 text-body font-semibold text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-error",
        className,
      )}
      {...rest}
    />
  ),
);
Textarea.displayName = "Textarea";
