import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing, rtlLocales } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { E2EProvider } from "@/components/e2e-provider";
import "../globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import { DisputeNotifications } from "@/components/notifications/dispute-notifications";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const ogLocale: Record<string, string> = {
  pt: "pt_AO",
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  zh: "zh_CN",
  ar: "ar_SA",
};

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: ogLocale[locale] ?? "pt_AO",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const dir = rtlLocales.has(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0f1a] transition-colors duration-300">
        <E2EProvider>
          <NextIntlClientProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <LocaleProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <DisputeNotifications />
                <ToastProvider />
              </LocaleProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </E2EProvider>
      </body>
    </html>
  );
}