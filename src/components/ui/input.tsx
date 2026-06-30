import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...rest }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-12 w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-4 text-body-lg font-bold text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-coral-400 aria-[invalid=true]:bg-coral-100/30",
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = "Input";
