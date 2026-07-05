import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { AuthBootstrap } from "@/components/auth-bootstrap";
import { TermsGate } from "@/components/layout/terms-gate";
import { OnboardingGate } from "@/components/features/onboarding/onboarding-gate";
import { TmaInit } from "@/components/tma-init";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MainRegion } from "@/components/layout/main-region";
import { FloatingBell } from "@/components/layout/floating-bell";
import { Footer } from "@/components/layout/footer";
import { QuickActions } from "@/components/features/quick-actions/quick-actions";
import { QuickToastContainer } from "@/components/layout/quick-toast";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/theme-provider";
import { WebVitals } from "@/components/web-vitals";
import { LogoMark, Spinner } from "@/components/ui";
import "./globals.css";

// Runs before first paint (after telegram-web-app.js). Inside a Telegram Mini
// App, initData is a non-empty string synchronously — mark <html> so the CSS
// boot splash (#tma-splash) covers the page from frame 0, preventing a flash of
// app content before the silent login resolves. AuthBootstrap clears the class.
const TMA_SPLASH_INIT_SCRIPT = `(function(){try{var w=window.Telegram&&window.Telegram.WebApp;if(w&&typeof w.initData==="string"&&w.initData.length>0)document.documentElement.classList.add("tma-boot")}catch(e){}})()`;

// Self-hosted (was next/font/google) — build no longer depends on reaching
// Google Fonts at compile time, and no render-blocking request to Google at
// runtime. Variable fonts (full glyph set incl. Cyrillic) under ./fonts.
const nunito = localFont({
  src: "./fonts/Nunito.ttf",
  weight: "400 900",
  variable: "--font-nunito",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// Display font (h1/h2/.font-disp). Fredoka has no Cyrillic — Russian/Kyrgyz
// display text falls through to Nunito 900.
const fredoka = localFont({
  src: "./fonts/Fredoka.ttf",
  weight: "300 700",
  variable: "--font-fredoka",
  display: "swap",
  fallback: ["var(--font-nunito)", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappjet.kg"),
  title: {
    default: "Tappjet — попутчики Кыргызстана",
    template: "%s | Tappjet",
  },
  description: "Найди попутчика Бишкек — Ош, Каракол, Нарын, Иссык-Куль.",
  openGraph: {
    siteName: "Tappjet",
    type: "website",
    locale: "ru_RU",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // env(safe-area-inset-*) used by the bottom nav is 0 on iOS without this.
  viewportFit: "cover",
  // Android Chrome 108+: on-screen keyboard shrinks the layout viewport so
  // focused inputs (chat, OTP) stay visible; bottom nav hides via useKeyboardOpen.
  interactiveWidget: "resizes-content",
  themeColor: "#0D9488",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${nunito.variable} ${fredoka.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <Script id="tma-splash-init" strategy="beforeInteractive">
          {TMA_SPLASH_INIT_SCRIPT}
        </Script>
      </head>
      <body className="min-h-screen font-sans">
        {/* Server-rendered boot splash — visibility is CSS-driven by the
            .tma-boot class on <html> (see globals.css + TMA_SPLASH_INIT_SCRIPT). */}
        <div id="tma-splash" aria-hidden="true">
          <LogoMark className="h-16 w-16" />
          <Spinner size={22} className="text-brand-600" />
        </div>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <Providers>
              <WebVitals />
              <TmaInit />
              <AuthBootstrap />
              <OnboardingGate />
              <TermsGate />
              <TopNav />
              <MainRegion>{children}</MainRegion>
              <Footer />
              <BottomNav />
              <FloatingBell />
              <QuickActions />
              <QuickToastContainer />
              <OfflineBanner />
            </Providers>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
