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
        "flex h-11 items-center rounded-xl border-[1.5px] bg-white pl-4 pr-1 transition-colors focus-within:border-teal-500",
        invalid ? "border-error" : "border-gray-300",
        className,
      )}
    >
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        aria-invalid={invalid || undefined}
        className="w-full border-none bg-transparent p-0 text-body font-bold text-gray-900 outline-none placeholder:text-gray-500 placeholder:font-semibold"
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
      >
        {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
