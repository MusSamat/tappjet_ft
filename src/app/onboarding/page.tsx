"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

const ONBOARDING_KEY = "tappjet_onboarding_done";

const SLIDE_ILLUSTRATIONS = [
  {
    accent: "teal",
    illustration: (
      <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden="true">
        <rect width="200" height="160" fill="#E0F2FE" />
        <polygon points="0,160 60,60 120,160" fill="#0D9488" opacity="0.7" />
        <polygon points="40,160 110,40 180,160" fill="#0D9488" />
        <polygon points="100,160 160,80 200,160" fill="#0F766E" opacity="0.8" />
        <polygon points="110,40 95,70 125,70" fill="white" opacity="0.9" />
        <path d="M20,160 Q100,130 180,160" fill="none" stroke="#94A3A0" strokeWidth="6" />
        <rect x="78" y="128" width="44" height="18" rx="5" fill="#F59E0B" />
        <rect x="84" y="120" width="32" height="14" rx="4" fill="#FBB924" />
        <circle cx="88" cy="148" r="6" fill="#1E293B" />
        <circle cx="112" cy="148" r="6" fill="#1E293B" />
        <rect x="87" y="122" width="12" height="9" rx="2" fill="#BAE6FD" opacity="0.8" />
        <rect x="101" y="122" width="12" height="9" rx="2" fill="#BAE6FD" opacity="0.8" />
      </svg>
    ),
  },
  {
    accent: "teal",
    illustration: (
      <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden="true">
        <rect width="200" height="160" fill="#F0FDF4" />
        <path d="M100,20 L140,38 L140,80 Q140,120 100,140 Q60,120 60,80 L60,38 Z" fill="#0D9488" opacity="0.15" />
        <path d="M100,28 L132,43 L132,80 Q132,114 100,130 Q68,114 68,80 L68,43 Z" fill="#0D9488" opacity="0.3" />
        <path d="M86,80 L96,90 L116,68" stroke="#0D9488" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="60" cy="100" r="16" fill="#FBB924" />
        <rect x="44" y="116" width="32" height="22" rx="8" fill="#F59E0B" />
        <circle cx="140" cy="100" r="16" fill="#34D399" />
        <rect x="124" y="116" width="32" height="22" rx="8" fill="#10B981" />
        {[30, 90, 150, 170, 10].map((x, i) => (
          <text key={i} x={x} y={[30, 20, 25, 55, 60][i]} fontSize="14" fill="#F59E0B" opacity="0.7">★</text>
        ))}
      </svg>
    ),
  },
  {
    accent: "amber",
    illustration: (
      <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden="true">
        <rect width="200" height="160" fill="#FFF7ED" />
        <rect x="65" y="15" width="70" height="120" rx="12" fill="#1E293B" />
        <rect x="70" y="22" width="60" height="106" rx="8" fill="#F8FAF9" />
        <rect x="76" y="32" width="36" height="18" rx="8" fill="#0D9488" />
        <rect x="88" y="58" width="38" height="18" rx="8" fill="#E4EAE8" />
        <rect x="76" y="84" width="32" height="18" rx="8" fill="#0D9488" />
        <polygon points="112,50 104,50 112,56" fill="#0D9488" />
        <polygon points="88,76 96,76 88,82" fill="#E4EAE8" />
        <rect x="72" y="108" width="56" height="14" rx="7" fill="#F1F5F4" />
        <path d="M120,115 L126,115" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
        <circle cx="30" cy="40" r="8" fill="#FED7AA" />
        <circle cx="170" cy="60" r="6" fill="#A7F3D0" />
        <circle cx="155" cy="130" r="10" fill="#FCD34D" />
      </svg>
    ),
  },
];

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [slide, setSlide] = useState(0);

  const SLIDE_TEXTS = [
    { title: t("slide0_title"), subtitle: t("slide0_subtitle") },
    { title: t("slide1_title"), subtitle: t("slide1_subtitle") },
    { title: t("slide2_title"), subtitle: t("slide2_subtitle") },
  ];

  const done = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    router.replace("/");
  };

  const next = () => {
    if (slide < SLIDE_ILLUSTRATIONS.length - 1) setSlide((s) => s + 1);
    else done();
  };

  const current = SLIDE_ILLUSTRATIONS[slide]!;
  const currentText = SLIDE_TEXTS[slide]!;
  const isLast = slide === SLIDE_ILLUSTRATIONS.length - 1;

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-white px-6 py-8">
      {/* Skip */}
      <div className="flex w-full max-w-sm justify-end">
        <button
          type="button"
          onClick={done}
          className="text-[13px] font-bold text-gray-400 hover:text-gray-600"
        >
          {t("skip")}
        </button>
      </div>

      {/* Illustration */}
      <div className="animate-card-in w-full max-w-sm">
        <div className="mx-auto h-52 w-full max-w-[280px]" key={slide}>
          {current.illustration}
        </div>

        {/* Text */}
        <div className="mt-8 text-center">
          <h1 className="text-[24px] font-extrabold leading-tight text-gray-900">
            {currentText.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
            {currentText.subtitle}
          </p>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex w-full max-w-sm flex-col items-center gap-5">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {SLIDE_ILLUSTRATIONS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              aria-label={t("slide_aria", { n: i + 1 })}
              className={`transition-all duration-200 ${
                i === slide
                  ? "h-2.5 w-7 rounded-full bg-teal-600"
                  : "h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={next}
          className="h-14 w-full rounded-2xl bg-amber-500 text-[16px] font-extrabold text-[#4A2C00] shadow-md shadow-amber-200 transition-transform active:scale-[0.98] hover:bg-amber-400"
        >
          {isLast ? t("start") : t("next")}
        </button>

        {/* Login link */}
        <Link
          href="/auth/login"
          className="text-[13px] font-bold text-gray-400 hover:text-teal-700"
        >
          {t("have_account")}
        </Link>
      </div>
    </div>
  );
}
