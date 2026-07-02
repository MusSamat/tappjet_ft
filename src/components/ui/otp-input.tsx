"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils/cn";

interface OtpInputProps {
  length?: number;
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
  className?: string;
}

export interface OtpInputHandle {
  clear: () => void;
  focus: () => void;
}

export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(
  ({ length = 6, onComplete, onChange, disabled, autoFocus, invalid, className }, ref) => {
    const [values, setValues] = useState<string[]>(() => Array(length).fill(""));
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      clear: () => {
        setValues(Array(length).fill(""));
        inputs.current[0]?.focus();
      },
      focus: () => inputs.current[0]?.focus(),
    }));

    const update = (next: string[]) => {
      setValues(next);
      const code = next.join("");
      onChange?.(code);
      if (code.length === length && !next.includes("")) onComplete?.(code);
    };

    const handleChange = (i: number, raw: string) => {
      const digit = raw.replace(/\D/g, "").slice(-1);
      const next = [...values];
      next[i] = digit;
      update(next);
      if (digit && i < length - 1) inputs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !values[i] && i > 0) {
        inputs.current[i - 1]?.focus();
      } else if (e.key === "ArrowLeft" && i > 0) {
        inputs.current[i - 1]?.focus();
      } else if (e.key === "ArrowRight" && i < length - 1) {
        inputs.current[i + 1]?.focus();
      }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      if (!pasted) return;
      e.preventDefault();
      const next = Array(length).fill("");
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
      update(next);
      const last = Math.min(pasted.length, length - 1);
      inputs.current[last]?.focus();
    };

    return (
      <div
        role="group"
        aria-label="Код из SMS"
        className={cn("flex items-center gap-2", className)}
      >
        {values.map((v, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            value={v}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`Цифра ${i + 1}`}
            aria-invalid={invalid || undefined}
            className={cn(
              "h-14 w-11 rounded-2xl border-2 text-center text-[22px] font-900 text-ink-900 outline-none transition-colors focus:border-brand-500 dark:text-white",
              invalid
                ? "border-danger-500 bg-white dark:bg-ink-900"
                : v
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-500/15"
                  : "border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900",
              "disabled:opacity-50",
            )}
          />
        ))}
      </div>
    );
  },
);
OtpInput.displayName = "OtpInput";
