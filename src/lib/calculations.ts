import type { EnergyRecord, CarbonRecord } from '../data/types'

export function calculateTotalEnergy(records: EnergyRecord[]): number {
  return records.reduce((sum, r) => sum + r.consumptionMWh, 0)
}

export function calculateTotalCarbon(records: CarbonRecord[]): number {
  return records.reduce((sum, r) => sum + r.emissionsTCO2e, 0)
}

export function calculateTotalCost(records: EnergyRecord[]): number {
  return records.reduce((sum, r) => sum + r.costIDR, 0)
}

/** Percentage change of `current` relative to `previous`. Returns 0 when previous is 0. */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / previous) * 100
}

export type AreaStat = {
  area: string
  consumptionMWh: number
  share: number
  costIDR: number
}

export function getAreaStats(records: EnergyRecord[]): AreaStat[] {
  const total = calculateTotalEnergy(records)
  const map = records.reduce((acc, r) => {
    if (!acc[r.area]) acc[r.area] = { consumptionMWh: 0, costIDR: 0 }
    acc[r.area].consumptionMWh += r.consumptionMWh
    acc[r.area].costIDR += r.costIDR
    return acc
  }, {} as Record<string, { consumptionMWh: number; costIDR: number }>)

  return Object.entries(map)
    .map(([area, v]) => ({
      area,
      consumptionMWh: v.consumptionMWh,
      costIDR: v.costIDR,
      share: total > 0 ? (v.consumptionMWh / total) * 100 : 0,
    }))
    .sort((a, b) => b.consumptionMWh - a.consumptionMWh)
}

export function countAboveBaseline(records: EnergyRecord[]): number {
  return records.filter((r) => r.consumptionMWh > r.baselineMWh).length
}

/**
 * Estimated cost already saved versus baseline for records that came in BELOW
 * baseline. Uses the effective daily tariff (costIDR / consumptionMWh) to value
 * the avoided MWh. Illustrative figure — not a validated saving.
 */
export function calculateRealizedSavings(records: EnergyRecord[]): number {
  return records.reduce((sum, r) => {
    if (r.consumptionMWh <= 0 || r.consumptionMWh >= r.baselineMWh) return sum
    const effectiveTariff = r.costIDR / r.consumptionMWh
    return sum + (r.baselineMWh - r.consumptionMWh) * effectiveTariff
  }, 0)
}

export function getPeakDay(records: EnergyRecord[]): { date: string; consumptionMWh: number } | null {
  const byDay = records.reduce((acc, r) => {
    acc[r.timestamp] = (acc[r.timestamp] ?? 0) + r.consumptionMWh
    return acc
  }, {} as Record<string, number>)

  const entries = Object.entries(byDay)
  if (entries.length === 0) return null
  const [date, consumptionMWh] = entries.sort((a, b) => b[1] - a[1])[0]
  return { date, consumptionMWh }
}

/** Share of readings within baseline (0–100). */
export function getEfficiencyScore(records: EnergyRecord[]): number {
  if (records.length === 0) return 0
  const within = records.filter((r) => r.consumptionMWh <= r.baselineMWh).length
  return Math.round((within / records.length) * 100)
}

export type DailySeries = { date: string; value: number }

export function getDailyEnergySeries(records: EnergyRecord[]): DailySeries[] {
  const byDay = records.reduce((acc, r) => {
    acc[r.timestamp] = (acc[r.timestamp] ?? 0) + r.consumptionMWh
    return acc
  }, {} as Record<string, number>)
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }))
}

export function getDailyCarbonSeries(records: CarbonRecord[]): DailySeries[] {
  const byDay = records.reduce((acc, r) => {
    acc[r.timestamp] = (acc[r.timestamp] ?? 0) + r.emissionsTCO2e
    return acc
  }, {} as Record<string, number>)
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }))
}

export function getDailyCostSeries(records: EnergyRecord[]): DailySeries[] {
  const byDay = records.reduce((acc, r) => {
    acc[r.timestamp] = (acc[r.timestamp] ?? 0) + r.costIDR
    return acc
  }, {} as Record<string, number>)
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }))
}

/**
 * Percent change between the second half and the first half of a daily series.
 * Always yields a value with the available dataset (unlike an empty previous window).
 */
export function getTrendDelta(series: DailySeries[]): number {
  if (series.length < 2) return 0
  const mid = Math.floor(series.length / 2)
  const earlier = series.slice(0, mid).reduce((s, d) => s + d.value, 0)
  const recent = series.slice(mid).reduce((s, d) => s + d.value, 0)
  return percentChange(recent, earlier)
}

