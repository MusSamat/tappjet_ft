"use client";

import { forwardRef, useEffect, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BaseProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">;

export interface PhoneInputProps extends BaseProps {
  value?: string;
  onValueChange?: (full: string) => void;
  invalid?: boolean;
  hint?: string;
}

const PREFIX = "+996";

function stripPrefix(full: string): string {
  return full.startsWith(PREFIX) ? full.slice(PREFIX.length) : full.replace(/\D/g, "");
}

function formatLocal(digits: string): string {
  const d = digits.slice(0, 9);
  const parts = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return parts.join(" ");
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onValueChange, invalid, hint, className, disabled, ...rest }, ref) => {
    const [local, setLocal] = useState<string>(() => (value ? stripPrefix(value) : ""));

    useEffect(() => {
      if (value !== undefined) setLocal(stripPrefix(value));
    }, [value]);

    const handleChange = (raw: string) => {
      const digits = raw.replace(/\D/g, "").slice(0, 9);
      setLocal(digits);
      onValueChange?.(digits ? `${PREFIX}${digits}` : "");
    };

    return (
      <div className="flex flex-col gap-1.5">
        <div
          className={cn(
            "flex h-12 items-center gap-2 rounded-2xl border-2 bg-white px-4 transition-colors focus-within:border-brand-500",
            invalid ? "border-coral-400 bg-coral-100/40" : "border-ink-200",
            disabled && "opacity-50",
            className,
          )}
        >
          <span className="select-none text-body-lg font-extrabold text-ink-500">{PREFIX}</span>
          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="XXX XX XX XX"
            value={formatLocal(local)}
            onChange={(e) => handleChange(e.target.value)}
            aria-invalid={invalid || undefined}
            disabled={disabled}
            className="w-full border-none bg-transparent p-0 text-body-lg font-extrabold text-ink-900 outline-none placeholder:text-ink-400 placeholder:font-semibold"
            {...rest}
          />
        </div>
        {hint && (
          <span className={cn("text-caption", invalid ? "text-coral-500" : "text-ink-500")}>
            {hint}
          </span>
        )}
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";
