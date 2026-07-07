import { PhoneInput } from "@/components/ui";
import { SocialButtons } from "@/components/features/auth/social-buttons";
import type { useTranslations } from "next-intl";

interface Props {
  tl: ReturnType<typeof useTranslations<string>>;
  phone: string;
  setPhone: (p: string) => void;
  setServerError: (e: string | null) => void;
  isPending?: boolean;
  onContinue: () => void;
}

const FULL_PHONE_RE = /^\+996\d{9}$/;

export function PhoneStep({ tl, phone, setPhone, setServerError, isPending, onContinue }: Props) {
  return (
    <>
      <div className="mb-5">
        <SocialButtons />
      </div>
      <div className="mb-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
        <span className="text-[12px] font-600 text-ink-400">{tl("or_phone")}</span>
        <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
      </div>

      <div className="mb-4 flex flex-col gap-1.5">
        <span className="text-[10px] font-700 uppercase tracking-widest text-ink-400">
          {tl("phone_label")}
        </span>
        <PhoneInput
          id="phone"
          value={phone}
          onValueChange={(full) => { setPhone(full); setServerError(null); }}
          invalid={false}
          placeholder="700 123 456"
        />
      </div>

      <button
        type="button"
        disabled={!FULL_PHONE_RE.test(phone) || isPending}
        onClick={onContinue}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 text-[14px] font-700 text-[#4A2C00] transition-colors hover:bg-accent-600 disabled:opacity-40"
      >
        {isPending ? tl("checking") : tl("continue_btn")}
      </button>

      <p className="mt-5 text-center text-[12px] text-ink-400">
        {tl("agree_prefix")}{" "}
        <a href="#" className="text-brand-600 underline">{tl("agree_terms")}</a>{" "}
        {tl("agree_and")}{" "}
        <a href="#" className="text-brand-600 underline">{tl("agree_privacy_link")}</a>
      </p>
    </>
  );
}
