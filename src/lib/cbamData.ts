import type { CarbonRecord, EnergyRecord, PlantOption } from '../data/types'
import { type CbamCommodity, EUR_TO_IDR } from '../data/cbam'
import { calculateTotalCarbon } from './calculations'

export type CbamExportData = {
  generatedAt: string
  plant: PlantOption
  periodLabel: string
  periodStart: Date
  periodEnd: Date
  commodity: CbamCommodity
  tonnes: number
  intensity: number
  embeddedEmissions: number
  costEur: number
  costIDR: number
  perTonneIDR: number
  perTonneCo2IDR: number
  energyMWh: number
  energyTJ: number
  directEmissions: number
  indirectEmissions: number
  totalEmissions: number
  monitoredEmissions: number
  sourceBreakdown: {
    source: string
    energyMWh: number
    activityT: number
    directTCO2e: number
  }[]
  checklist: { label: string; done: boolean }[]
  completion: number
}

const GAS_NCV_GJ_PER_T = 48
const GAS_EF_TCO2_PER_TJ = 56.1

export function buildCbamExportData(
  plant: PlantOption,
  periodLabel: string,
  commodity: CbamCommodity,
  tonnes: number,
  intensity: number,
  energyRecords: EnergyRecord[],
  carbonRecords: CarbonRecord[],
  checklistState: Record<string, boolean>,
  checklistItems: { id: string; label: string }[]
): CbamExportData {
  const energyFiltered = energyRecords.filter((r) => r.plant === plant)
  const carbonFiltered = carbonRecords.filter((r) => r.plant === plant)

  const energyMWh = energyFiltered.reduce((s, r) => s + r.consumptionMWh, 0)
  const energyTJ = energyMWh * 0.0036
  const directEmissions = energyTJ * GAS_EF_TCO2_PER_TJ
  const monitoredEmissions = calculateTotalCarbon(carbonFiltered)
  const indirectEmissions = carbonFiltered
    .filter((r) => r.scope === 'Scope 2')
    .reduce((s, r) => s + r.emissionsTCO2e, 0)

  // Group energy by area for source streams
  const areaMap = new Map<string, number>()
  energyFiltered.forEach((r) => {
    areaMap.set(r.area, (areaMap.get(r.area) || 0) + r.consumptionMWh)
  })

  const sourceBreakdown = Array.from(areaMap.entries()).map(([source, mwh]) => {
    const tj = mwh * 0.0036
    const activityT = (tj * 1000) / GAS_NCV_GJ_PER_T
    const directTCO2e = tj * GAS_EF_TCO2_PER_TJ
    return {
      source: `${source} (Combustion)`,
      energyMWh: mwh,
      activityT,
      directTCO2e,
    }
  })

  const totalEmissions = monitoredEmissions
  const costEur = commodity.ratePerTonneEur * tonnes
  const costIDR = costEur * EUR_TO_IDR
  const perTonneIDR = commodity.ratePerTonneEur * EUR_TO_IDR
  const embeddedEmissions = intensity * tonnes
  const perTonneCo2IDR = embeddedEmissions > 0 ? costIDR / embeddedEmissions : 0

  const now = new Date()
  const periodDaysMap: Record<string, number> = {
    'Last 7 Days': 7,
    'Last 30 Days': 30,
    'Last 90 Days': 90,
  }
  const referenceTimestamps = [...energyFiltered, ...carbonFiltered]
    .map((r) => r.timestamp)
    .sort()
  const reference = referenceTimestamps.length > 0 ? referenceTimestamps[referenceTimestamps.length - 1] : undefined
  const periodEnd = reference ? new Date(reference) : now
  const periodStart = new Date(periodEnd)
  periodStart.setDate(periodStart.getDate() - (periodDaysMap[periodLabel] ?? 30))

  const checklist = checklistItems.map((i) => ({
    label: i.label,
    done: !!checklistState[i.id],
  }))
  const completed = checklist.filter((i) => i.done).length
  const completion = checklist.length > 0 ? Math.round((completed / checklist.length) * 100) : 0

  return {
    generatedAt: now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    plant,
    periodLabel,
    periodStart,
    periodEnd: now,
    commodity,
    tonnes,
    intensity,
    embeddedEmissions,
    costEur,
    costIDR,
    perTonneIDR,
    perTonneCo2IDR,
    energyMWh,
    energyTJ,
    directEmissions,
    indirectEmissions,
    totalEmissions,
    monitoredEmissions,
    sourceBreakdown,
    checklist,
    completion,
  }
}
