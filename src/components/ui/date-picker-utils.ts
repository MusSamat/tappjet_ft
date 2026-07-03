// Month/weekday names for the calendar come from Intl.DateTimeFormat
// (see date-picker.tsx); only short display strings live here.
export const LOCALE_DATA = {
  ru: {
    monthsShort: [
      "янв", "фев", "мар", "апр", "май", "июн",
      "июл", "авг", "сен", "окт", "ноя", "дек",
    ],
  },
  kg: {
    monthsShort: [
      "янв", "фев", "мар", "апр", "май", "июн",
      "июл", "авг", "сен", "окт", "ноя", "дек",
    ],
  },
} as const;

export type Locale = keyof typeof LOCALE_DATA;

export function toYMD(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function parseYMD(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

export function formatDisplay(val: string, locale: Locale): string {
  const d = parseYMD(val);
  if (!d) return "";
  const l = LOCALE_DATA[locale];
  const thisYear = new Date().getFullYear();
  const mon = l.monthsShort[d.getMonth()];
  return d.getFullYear() !== thisYear
    ? `${d.getDate()} ${mon} ${d.getFullYear()}`
    : `${d.getDate()} ${mon}`;
}

function mondayDow(d: Date): number {
  const dow = d.getDay();
  return dow === 0 ? 6 : dow - 1;
}

export function buildGrid(year: number, month: number): (number | null)[] {
  const offset = mondayDow(new Date(year, month, 1));
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function dayYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
