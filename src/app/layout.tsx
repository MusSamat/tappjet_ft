import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { AuthBootstrap } from "@/components/auth-bootstrap";
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
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

// Display font (h1/h2/.font-disp). Google Fonts has no Cyrillic subset for
// Fredoka — Russian/Kyrgyz display text falls through to Nunito 900.
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fredoka",
  display: "swap",
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
      </head>
      <body className="min-h-screen font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <Providers>
              <TmaInit />
              <AuthBootstrap />
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
