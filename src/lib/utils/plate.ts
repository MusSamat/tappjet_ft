// Единый стандарт госномера КР — зеркало backend src/lib/plate.ts.
// Нормализация при вводе: верхний регистр, только латиница и цифры, максимум
// 10 символов. Валиден 4–10 символов — покрывает стандарт 2016+ (01KG123ABC)
// и номера старого образца.
export function normalizePlate(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

export function isPlateValid(plate: string): boolean {
  return /^[A-Z0-9]{4,10}$/.test(plate);
}
