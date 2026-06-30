"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface CardFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value"> {
  icon: ReactNode;
  label: string;
  value?: string;
  iconBg?: string;
  className?: string;
}

export const CardField = forwardRef<HTMLInputElement, CardFieldProps>(
  ({ icon, label, value, iconBg = "bg-brand-50", className, placeholder, readOnly, ...rest }, ref) => (
    <label
      className={cn(
        "group flex cursor-pointer items-center gap-3 bg-white px-4 py-3 transition-colors focus-within:bg-brand-50/40",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base",
          iconBg,
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-label uppercase tracking-wider text-ink-500">{label}</span>
        <input
          ref={ref}
          type="text"
          defaultValue={value}
          placeholder={placeholder}
          readOnly={readOnly}
          className="mt-0.5 w-full border-none bg-transparent p-0 text-body-lg font-bold text-ink-900 outline-none placeholder:text-ink-500 placeholder:font-semibold"
          {...rest}
        />
      </span>
    </label>
  ),
);
CardField.displayName = "CardField";
