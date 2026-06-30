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
            "flex h-11 items-center rounded-xl border-2 bg-white px-4 transition-colors focus-within:border-teal-500",
            invalid ? "border-error" : "border-gray-300",
            disabled && "opacity-50",
            className,
          )}
        >
          <span className="select-none pr-2 text-body font-bold text-gray-900">{PREFIX}</span>
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
            className="w-full border-none bg-transparent p-0 text-body font-bold text-gray-900 outline-none placeholder:text-gray-500 placeholder:font-semibold"
            {...rest}
          />
        </div>
        {hint && (
          <span className={cn("text-caption", invalid ? "text-error" : "text-gray-500")}>
            {hint}
          </span>
        )}
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";
