"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { invalid?: boolean }
>(({ className, invalid, ...rest }, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className={cn(
        "flex h-12 items-center rounded-2xl border-2 bg-white pl-4 pr-1 transition-colors focus-within:border-brand-500",
        invalid ? "border-coral-500" : "border-ink-200",
        className,
      )}
    >
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        aria-invalid={invalid || undefined}
        className="w-full border-none bg-transparent p-0 text-body-lg font-bold text-ink-900 outline-none placeholder:text-ink-500 placeholder:font-semibold"
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
      >
        {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
