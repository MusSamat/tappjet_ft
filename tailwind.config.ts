import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Design tokens — mirror design/design-system.html ("bright & friendly").
// Legacy names (teal/amber/gray) are aliased onto the new palette so existing
// pages keep working while components migrate to brand/accent/ink.
const brand = {
  50: "#ECFDF8",
  100: "#D0FBEF",
  200: "#A4F4DF",
  300: "#6FE7CC",
  400: "#38D3B6",
  500: "#14B8A6",
  600: "#0D9488",
  700: "#0F766E",
  800: "#115E56",
  900: "#134E48",
};
const accent = {
  50: "#FFF8EB",
  100: "#FEEFC7",
  200: "#FDDF8A",
  300: "#FCCB4D",
  400: "#FBB924",
  500: "#F59E0B",
  600: "#D97706",
  700: "#B45309",
};
const ink = {
  50: "#F8FAF9",
  100: "#F1F5F4",
  200: "#E4EAE8",
  300: "#CBD5D2",
  400: "#94A3A0",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1E293B",
  900: "#0F172A",
};

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand,
        accent,
        ink,
        // legacy aliases → new palette (no breakage for existing classes)
        teal: brand,
        amber: accent,
        gray: ink,
        coral: { 100: "#FFE4E6", 400: "#FB7185", 500: "#F43F5E", 600: "#E11D48" },
        sky: { 100: "#E0F2FE", 400: "#38BDF8", 500: "#0EA5E9", 600: "#0284C7" },
        grape: { 100: "#EDE9FE", 400: "#A78BFA", 500: "#8B5CF6", 600: "#7C3AED" },
        success: "#14B8A6",
        error: "#F43F5E",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["32px", { lineHeight: "1.12", fontWeight: "900" }],
        h1: ["24px", { lineHeight: "1.2", fontWeight: "800" }],
        h2: ["18px", { lineHeight: "1.3", fontWeight: "800" }],
        "body-lg": ["15px", { lineHeight: "1.5", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "700" }],
        label: ["11px", { lineHeight: "1.2", fontWeight: "800", letterSpacing: "0.08em" }],
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(13,148,136,0.10), 0 4px 24px -8px rgba(15,23,42,0.08)",
        card: "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px -12px rgba(15,23,42,0.10)",
        cta: "0 8px 20px -6px rgba(245,158,11,0.45)",
        brandcta: "0 8px 20px -6px rgba(13,148,136,0.45)",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "16px",
          md: "24px",
          lg: "32px",
        },
        screens: {
          xl: "1280px",
        },
      },
    },
  },
  plugins: [animate],
};

export default config;
