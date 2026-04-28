import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...rest }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border-[1.5px] border-gray-300 bg-white px-4 text-body font-semibold text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-error",
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = "Input";
