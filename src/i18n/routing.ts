import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "es", "fr", "zh", "ar"],
  defaultLocale: "pt",
  localePrefix: "as-needed",
  localeDetection: true,
});

export const localeNames: Record<string, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
  fr: "Français",
  zh: "简体中文",
  ar: "العربية",
};

export const rtlLocales = new Set(["ar"]);