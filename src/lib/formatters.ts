export function formatCurrencyIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatMWh(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)} MWh`
}

export function formatTCO2e(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)} tCO₂e`
}

export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals)
}

/** Compact IDR for large sums, e.g. Rp 1,2 M for millions. */
export function formatCurrencyIDRCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} M`
  if (Math.abs(value) >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} jt`
  if (Math.abs(value) >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} rb`
  return formatCurrencyIDR(value)
}
