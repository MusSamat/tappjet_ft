const DAY_MS = 24 * 60 * 60 * 1000;

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatDepartureLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const today = startOfDay(now);
  const that = startOfDay(d);
  const days = Math.round((that.getTime() - today.getTime()) / DAY_MS);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (days === 0) return `Сегодня, ${time}`;
  if (days === 1) return `Завтра, ${time}`;
  if (days === -1) return `Вчера, ${time}`;

  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}, ${time}`;
}

export function formatIsoDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDurationMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU")} сом`;
}

const SHORT_MONTHS = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`;
}
