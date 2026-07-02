import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Tappjet — Brand",
  robots: { index: false, follow: false },
};

/** Paper-plane logo mark on a teal tile — sized by px. */
function LogoTile({ px, radius }: { px: number; radius: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{
        width: px,
        height: px,
        borderRadius: radius,
        background: "linear-gradient(150deg,#2CC9B4,#0C8478)",
      }}
    >
      <svg viewBox="0 0 48 48" width={px * 0.68} height={px * 0.68} aria-hidden="true">
        <path d="M9 27 L39 13 L28 39 L23.5 29 Z" fill="#fff" />
        <path d="M23.5 29 L39 13 L26.5 28 Z" fill="#fff" opacity="0.82" />
        <circle cx="39" cy="11.5" r="4.2" fill="#FBB924" stroke="#fff" strokeWidth="1.4" />
      </svg>
    </span>
  );
}

const SWATCHES = [
  { name: "Teal", hex: "#0D9488" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Grape", hex: "#4F46E5" },
  { name: "Ink", hex: "#0c0a09" },
];

export default async function BrandPage() {
  const t = await getTranslations("brand");

  return (
    <div className="min-h-screen bg-ink-50 py-10 dark:bg-ink-950">
      <div className="mx-auto max-w-[720px] space-y-4 px-4">
        {/* Hero */}
        <div
          className="overflow-hidden rounded-4xl bg-white shadow-card dark:bg-ink-900"
          style={{ background: "radial-gradient(120% 120% at 0% 0%, #ECFDF8 0%, #fff 60%)" }}
        >
          <div className="flex flex-col items-center gap-4 py-12">
            <LogoTile px={120} radius={36} />
            <p className="font-disp text-[42px] font-600 leading-none">
              tapp<span className="text-brand-600">jet</span>
            </p>
            <p className="max-w-[300px] text-center text-[13px] font-600 text-ink-500">{t("tagline")}</p>
          </div>
        </div>

        {/* App icon sizes */}
        <div className="rounded-4xl bg-white p-6 shadow-card dark:bg-ink-900">
          <h2 className="mb-4 text-[15px] font-900 text-ink-900 dark:text-white">{t("app_icon")}</h2>
          <div className="flex items-end gap-4">
            <LogoTile px={64} radius={18} />
            <LogoTile px={48} radius={14} />
            <LogoTile px={32} radius={10} />
            <LogoTile px={24} radius={7} />
          </div>
        </div>

        {/* Horizontal lockup */}
        <div className="rounded-4xl bg-white p-6 shadow-card dark:bg-ink-900">
          <div className="flex items-center gap-3">
            <LogoTile px={40} radius={12} />
            <span className="font-disp text-[26px] font-600 text-ink-900 dark:text-white">
              tapp<span className="text-brand-600">jet</span>
            </span>
          </div>
        </div>

        {/* Dark + mono */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-3 rounded-4xl p-6" style={{ background: "#0c0a09" }}>
            <LogoTile px={56} radius={16} />
            <span className="font-disp text-[22px] font-600 text-white">
              tapp<span style={{ color: "#6FE7CC" }}>jet</span>
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-4xl bg-ink-100 p-6 dark:bg-ink-800">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "#0D9488" }}
            >
              <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
                <path d="M9 27 L39 13 L28 39 L23.5 29 Z" fill="#fff" />
              </svg>
            </span>
            <span className="font-disp text-[22px] font-600 text-ink-700 dark:text-ink-200">tappjet</span>
          </div>
        </div>

        {/* Colors */}
        <div className="rounded-4xl bg-white p-6 shadow-card dark:bg-ink-900">
          <h2 className="mb-4 text-[15px] font-900 text-ink-900 dark:text-white">{t("colors_title")}</h2>
          <div className="grid grid-cols-4 gap-3">
            {SWATCHES.map((s) => (
              <div key={s.name}>
                <div className="h-12 rounded-xl" style={{ background: s.hex }} />
                <p className="mt-1.5 text-[10px] font-800 text-ink-500">{s.name}</p>
                <p className="text-[10px] font-600 text-ink-400">{s.hex}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
