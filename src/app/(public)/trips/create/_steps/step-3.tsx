"use client";

import { ArrowRight, Shield } from "lucide-react";
import { ToggleCard } from "../_components/toggle-card";

interface Step3Props {
  comment: string;
  prefSilence: boolean;
  prefMusic: boolean;
  prefNoSmoking: boolean;
  onPatchComment: (v: string) => void;
  onToggleSilence: () => void;
  onToggleMusic: () => void;
  onToggleNoSmoking: () => void;
  onBack: () => void;
  onNext: () => void;
  t: (key: string) => string;
}

export function Step3({
  comment,
  prefSilence,
  prefMusic,
  prefNoSmoking,
  onPatchComment,
  onToggleSilence,
  onToggleMusic,
  onToggleNoSmoking,
  onBack,
  onNext,
  t,
}: Step3Props) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[17px] font-bold text-ink-900">{t("step3_title")}</h2>

      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ink-400">
          {t("prefs_label")}
        </p>
        <div className="flex flex-col gap-2">
          <ToggleCard
            label={t("pref_silence_label")}
            hint={t("pref_silence_hint")}
            on={prefSilence}
            onToggle={onToggleSilence}
          />
          <ToggleCard
            label={t("pref_music_label")}
            hint={t("pref_music_hint")}
            on={prefMusic}
            onToggle={onToggleMusic}
          />
          <ToggleCard
            label={t("pref_no_smoke_label")}
            on={prefNoSmoking}
            onToggle={onToggleNoSmoking}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-400">
          {t("comment_label")}
        </p>
        <textarea
          rows={3}
          maxLength={400}
          value={comment}
          onChange={(e) => onPatchComment(e.target.value)}
          placeholder={t("comment_placeholder")}
          className="w-full resize-none rounded-2xl border-2 border-ink-200 bg-ink-50 px-4 py-3 text-[13px] font-semibold text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-500"
        />
        <div className="mt-1 text-right text-[11px] text-ink-400">{comment.length}/400</div>
      </div>

      <div className="flex gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4">
        <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600" aria-hidden="true" />
        <div>
          <p className="text-[13px] font-bold text-brand-800">{t("ready_title")}</p>
          <p className="mt-0.5 text-[12px] text-brand-700">{t("ready_desc")}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 flex-1 items-center justify-center rounded-2xl border-2 border-ink-200 text-[14px] font-bold text-ink-700 hover:bg-ink-50"
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-2xl bg-accent-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-accent-600 disabled:opacity-40"
        >
          {t("next")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
