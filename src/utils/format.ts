export function formatMoney(value: number, currency = "EGP", locale = "ar-EG") {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}
export function formatNumber(value: number, locale = "ar-EG") { return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value); }
export function uid(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
export function documentNumber(prefix: string, count: number) { return `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`; }
