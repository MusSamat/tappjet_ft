import React from "react";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { useTranslations } from "next-intl";

interface Props {
  tl: ReturnType<typeof useTranslations<string>>;
  newPassword: string;
  setNewPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (p: string) => void;
  serverError: string | null;
  setServerError: (e: string | null) => void;
  showNewPassword: boolean;
  setShowNewPassword: (fn: (v: boolean) => boolean) => void;
  newPasswordRef: React.RefObject<HTMLInputElement>;
  canReset: boolean;
  resetMutation: { isPending: boolean; mutate: () => void };
  onSkip: () => void;
}

export function ResetStep({
  tl, newPassword, setNewPassword, confirmPassword, setConfirmPassword,
  serverError: _serverError, setServerError, showNewPassword, setShowNewPassword,
  newPasswordRef, canReset, resetMutation, onSkip,
}: Props) {
  return (
    <>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
          <CheckCircle className="h-6 w-6 text-teal-600" aria-hidden="true" />
        </div>
        <p className="text-[16px] font-extrabold text-gray-900">{tl("reset_title")}</p>
        <p className="mt-1 text-[12px] font-semibold text-gray-500">{tl("reset_min_chars")}</p>
      </div>

      <div className="mb-3 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {tl("new_password_label")}
        </span>
        <div className="relative">
          <input
            ref={newPasswordRef}
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setServerError(null); }}
            placeholder={tl("new_password_placeholder")}
            className="h-11 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 pr-10 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showNewPassword ? tl("new_password_hide") : tl("new_password_show")}
          >
            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {tl("confirm_password_label")}
        </span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setServerError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter" && canReset) resetMutation.mutate(); }}
          placeholder={tl("confirm_password_placeholder")}
          className={cn(
            "h-11 w-full rounded-xl border-[1.5px] bg-gray-50 px-3 text-[14px] font-semibold outline-none",
            confirmPassword && confirmPassword !== newPassword
              ? "border-coral-300 text-coral-700"
              : "border-gray-200 text-gray-900 focus:border-teal-500",
          )}
        />
        {confirmPassword && confirmPassword !== newPassword && (
          <p className="text-[11px] font-semibold text-coral-600">{tl("passwords_mismatch")}</p>
        )}
      </div>

      <button
        type="button"
        disabled={!canReset || resetMutation.isPending}
        onClick={() => resetMutation.mutate()}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 disabled:opacity-40"
      >
        {resetMutation.isPending ? tl("saving") : tl("save_password")}
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="mt-3 w-full text-center text-[13px] font-semibold text-gray-500 hover:text-gray-700"
      >
        {tl("skip_btn")}
      </button>
    </>
  );
}
