import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Sum line items: numbers as-is; strings use the first number found (e.g. "ab 25 €" → 25). */
export function parseServicePriceForTotal(price: string | number): number {
  if (typeof price === 'number') {
    return Number.isFinite(price) ? price : 0
  }
  const m = String(price).trim().match(/-?\d+(?:[.,]\d+)?/)
  if (!m) return 0
  return parseFloat(m[0].replace(',', '.'))
}

/** Plain-text / fixed decimals for numbers; passthrough for string prices. */
export function formatServicePricePlain(price: string | number): string {
  if (typeof price === 'number' && Number.isFinite(price)) {
    return price.toFixed(2)
  }
  return String(price)
}
