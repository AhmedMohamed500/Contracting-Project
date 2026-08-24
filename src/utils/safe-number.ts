export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string" && value.trim() !== "") {
    const normalized = Number(value.replaceAll(",", ""));
    return Number.isFinite(normalized) ? normalized : fallback;
  }
  return fallback;
}

export function safeSum<T>(values: T[], selector: (value: T) => unknown): number {
  return values.reduce((total, value) => total + safeNumber(selector(value)), 0);
}

export function safeDivide(numerator: unknown, denominator: unknown, fallback = 0): number {
  const divisor = safeNumber(denominator);
  return divisor === 0 ? fallback : safeNumber(numerator) / divisor;
}
