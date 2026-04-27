"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { useTranslations } from "next-intl";

interface Props {
  tl: ReturnType<typeof useTranslations<string>>;
  displayPhone: string;
  hasPassword: boolean;
  password: string;
  setPassword: (p: string) => void;
  serverError: string | null;
  setServerError: (e: string | null) => void;
  showPassword: boolean;
  setShowPassword: (v: (prev: boolean) => boolean) => void;
  passwordRef: React.RefObject<HTMLInputElement>;
  passwordMutation: { isPending: boolean; mutate: () => void };
  sendMutation: { isPending: boolean };
  onBack: () => void;
  onOtp: () => void;
}

export function PasswordStep({
  tl, displayPhone, hasPassword, password, setPassword, serverError, setServerError,
  showPassword, setShowPassword, passwordRef, passwordMutation, sendMutation,
  onBack, onOtp,
}: Props) {
  return (
    <>
      <div className="mb-6 text-center">
        <p className="text-[14px] text-gray-600">{tl("password_step_label")}</p>
        <p className="mt-1 text-[17px] font-bold text-gray-900">+996 {displayPhone}</p>
      </div>

      {hasPassword ? (
        <>
          <div className="mb-4 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {tl("password_label")}
            </span>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setServerError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter" && password) passwordMutation.mutate(); }}
                placeholder={tl("password_placeholder")}
                className={cn(
                  "h-11 w-full rounded-xl border-[1.5px] bg-gray-50 px-3 pr-10 text-[14px] font-semibold outline-none transition-colors",
                  serverError
                    ? "border-red-400 text-red-700"
                    : "border-gray-200 text-gray-900 focus:border-teal-500",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? tl("password_hide") : tl("password_show")}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={!password || passwordMutation.isPending}
            onClick={() => passwordMutation.mutate()}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-amber-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 disabled:opacity-40"
          >
            {passwordMutation.isPending ? tl("logging_in") : tl("login_btn")}
          </button>

          <div className="mt-4 flex flex-col items-center gap-3">
            <button type="button" onClick={onBack} className="text-[13px] font-bold text-gray-600 hover:text-gray-900">
              {tl("change_number")}
            </button>
            <button
              type="button"
              disabled={sendMutation.isPending}
              onClick={onOtp}
              className="text-[12px] font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {sendMutation.isPending ? tl("sending") : tl("forgot_password")}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-center">
            <p className="text-[13px] font-semibold text-amber-800">{tl("no_password_hint")}</p>
          </div>

          <button
            type="button"
            disabled={sendMutation.isPending}
            onClick={onOtp}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-amber-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 disabled:opacity-40"
          >
            {sendMutation.isPending ? tl("sending") : tl("set_password_btn")}
          </button>

          <div className="mt-4 flex justify-center">
            <button type="button" onClick={onBack} className="text-[13px] font-bold text-gray-600 hover:text-gray-900">
              {tl("change_number")}
            </button>
          </div>
        </>
      )}
    </>
  );
}
