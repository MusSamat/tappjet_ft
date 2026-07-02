import type { Locale } from "@/i18n.config";

const DAY_MS = 24 * 60 * 60 * 1000;

// Display strings for date/duration formatting, keyed by locale. Kept internal
// so callers only thread the active locale (from useLocale()/getLocale()).
// Kyrgyz choice: modern kg UI uses the Russian-root month names in nominative
// form with a hyphenated day ("5-декабрь"), plus native relative labels
// (Бүгүн/Эртең/Кечээ) and мүн/саат for minute/hour.
type DateLabels = {
  today: string;
  tomorrow: string;
  yesterday: string;
  months: readonly string[];
  shortMonths: readonly string[];
  daySep: string;
  minute: string;
  hour: string;
};

const LABELS: Record<Locale, DateLabels> = {
  ru: {
    today: "Сегодня",
    tomorrow: "Завтра",
    yesterday: "Вчера",
    months: [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря",
    ],
    shortMonths: [
      "янв", "фев", "мар", "апр", "май", "июн",
      "июл", "авг", "сен", "окт", "ноя", "дек",
    ],
    daySep: " ",
    minute: "мин",
    hour: "ч",
  },
  kg: {
    today: "Бүгүн",
    tomorrow: "Эртең",
    yesterday: "Кечээ",
    months: [
      "январь", "февраль", "март", "апрель", "май", "июнь",
      "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
    ],
    shortMonths: [
      "янв", "фев", "мар", "апр", "май", "июн",
      "июл", "авг", "сен", "окт", "ноя", "дек",
    ],
    daySep: "-",
    minute: "мүн",
    hour: "саат",
  },
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatDepartureLabel(
  iso: string,
  locale: Locale = "ru",
  now: Date = new Date(),
): string {
  const L = LABELS[locale];
  const d = new Date(iso);
  const today = startOfDay(now);
  const that = startOfDay(d);
  const days = Math.round((that.getTime() - today.getTime()) / DAY_MS);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (days === 0) return `${L.today}, ${time}`;
  if (days === 1) return `${L.tomorrow}, ${time}`;
  if (days === -1) return `${L.yesterday}, ${time}`;

  return `${d.getDate()}${L.daySep}${L.months[d.getMonth()]}, ${time}`;
}

export function formatIsoDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDurationMin(min: number, locale: Locale = "ru"): string {
  const L = LABELS[locale];
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} ${L.minute}`;
  if (m === 0) return `${h} ${L.hour}`;
  return `${h} ${L.hour} ${m} ${L.minute}`;
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU")} сом`;
}

export function formatShortDate(iso: string, locale: Locale = "ru"): string {
  const L = LABELS[locale];
  const d = new Date(iso);
  return `${d.getDate()}${L.daySep}${L.shortMonths[d.getMonth()]}`;
}
