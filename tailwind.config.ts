import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          900: "#0D3D38",
        },
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          300: "#D1D5DB",
          500: "#6B7280",
          700: "#374151",
          900: "#111827",
        },
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["32px", { lineHeight: "1.15", fontWeight: "800" }],
        h1: ["24px", { lineHeight: "1.25", fontWeight: "700" }],
        h2: ["18px", { lineHeight: "1.3", fontWeight: "700" }],
        "body-lg": ["15px", { lineHeight: "1.5", fontWeight: "400" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "600" }],
        label: ["10px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "0.06em" }],
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
        "3xl": "20px",
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
