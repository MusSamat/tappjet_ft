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
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-[12px] font-semibold text-gray-400">{tl("or_phone")}</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="mb-4 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {tl("phone_label")}
        </span>
        <div className="flex gap-2">
          <div className="flex h-11 w-[52px] flex-shrink-0 items-center justify-center rounded-xl border-[1.5px] border-gray-200 text-[20px]">
            🇰🇬
          </div>
          <PhoneInput
            id="phone"
            value={phone}
            onValueChange={(full) => { setPhone(full); setServerError(null); }}
            invalid={false}
            className="flex-1"
            placeholder="700 123 456"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={!FULL_PHONE_RE.test(phone) || isPending}
        onClick={onContinue}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 disabled:opacity-40"
      >
        {isPending ? tl("checking") : tl("continue_btn")}
      </button>

      <p className="mt-5 text-center text-[11px] text-gray-400">
        {tl("agree_prefix")}{" "}
        <a href="#" className="text-teal-600 underline">{tl("agree_terms")}</a>{" "}
        {tl("agree_and")}{" "}
        <a href="#" className="text-teal-600 underline">{tl("agree_privacy_link")}</a>
      </p>
    </>
  );
}
