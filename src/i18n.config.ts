export const locales = ["ru", "kg"] as const;
export const defaultLocale = "ru" as const;
export type Locale = (typeof locales)[number];

export function isLocale(v: string | undefined): v is Locale {
  return v === "ru" || v === "kg";
}
