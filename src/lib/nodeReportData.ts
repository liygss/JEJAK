import type { CarbonRecord, EnergyRecord, PlantOption } from '../data/types'
import { fleetDevices, type DataQuality } from '../data/admin'
import { cbamCommodities } from '../data/cbam'

export type NodeReportSnapshot = {
  id: string
  generatedAt: string
  generatedAtISO: string
  plant: PlantOption
  commodityId: string
  tonnes: number
  intensity: number
  energyRecords: EnergyRecord[]
  carbonRecords: CarbonRecord[]
  deviceCount: number
  onlineCount: number
  degradedCount: number
  totalReadingsPerHour: number
  sourceLabel: string
}

const NODE_PLANT: PlantOption = 'Manufacturing Plant A'
const READING_TO_MWH = 0.01
const MWH_TO_TJ = 0.0036
const TJ_TO_TCO2 = 56.1
const TONNES_PER_MWH = 0.11
const IDR_PER_MWH = 1_500_000
const HISTORY_DAYS = 90

const LOCATION_TO_AREA: Record<string, string> = {
  'Main Substation': 'Utilities',
  'Production Line': 'Production Line',
  'HVAC Room': 'HVAC',
  'Utility Area': 'Utilities',
  Packaging: 'Production Line',
  Warehouse: 'Utilities',
}

const AREA_TO_COMMODITY: Record<string, string> = {
  'Production Line': 'steel',
  HVAC: 'aluminium',
  Utilities: 'cement',
}

type AreaAggregate = {
  area: string
  readingsPerHour: number
  uptimePct: number
  worstQuality: DataQuality
  deviceCount: number
}

const qualityRank: Record<DataQuality, number> = { Good: 0, Degraded: 1, Missing: 2 }

function aggregateByArea(): AreaAggregate[] {
  const map = new Map<string, AreaAggregate>()
  fleetDevices.forEach((device) => {
    if (device.status === 'Offline') return
    const area = LOCATION_TO_AREA[device.location]
    if (!area) return
    const current = map.get(area) ?? {
      area,
      readingsPerHour: 0,
      uptimePct: 0,
      worstQuality: 'Good' as DataQuality,
      deviceCount: 0,
    }
    current.readingsPerHour += device.readingsPerHour
    current.uptimePct += device.uptimePct
    current.deviceCount += 1
    if (qualityRank[device.dataQuality] > qualityRank[current.worstQuality]) {
      current.worstQuality = device.dataQuality
    }
    map.set(area, current)
  })
  return Array.from(map.values()).map((item) => ({
    ...item,
    uptimePct: item.deviceCount > 0 ? item.uptimePct / item.deviceCount : 0,
  }))
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function buildNodeSnapshot(now: Date = new Date()): NodeReportSnapshot {
  const areas = aggregateByArea()
  const totalReadingsPerHour = areas.reduce((sum, a) => sum + a.readingsPerHour, 0)
  const energyRecords: EnergyRecord[] = []
  const carbonRecords: CarbonRecord[] = []

  for (let dayIndex = 0; dayIndex < HISTORY_DAYS; dayIndex++) {
    const date = new Date(now)
    date.setDate(date.getDate() - (HISTORY_DAYS - 1 - dayIndex))
    const timestamp = isoDay(date)
    const dayFactor = 0.92 + 0.08 * Math.sin(dayIndex / 3)

    areas.forEach((area) => {
      const consumptionMWh =
        Math.round(area.readingsPerHour * 24 * READING_TO_MWH * (area.uptimePct / 100) * dayFactor * 100) / 100
      if (consumptionMWh <= 0) return
      energyRecords.push({
        timestamp,
        plant: NODE_PLANT,
        area: area.area,
        consumptionMWh,
        baselineMWh: Math.round((consumptionMWh / 1.05) * 100) / 100,
        costIDR: Math.round(consumptionMWh * IDR_PER_MWH),
        source: 'IoT Simulation',
      })
      carbonRecords.push({
        timestamp,
        plant: NODE_PLANT,
        source: area.area,
        scope: 'Scope 2',
        emissionsTCO2e: Math.round(consumptionMWh * MWH_TO_TJ * TJ_TO_TCO2 * 100) / 100,
        dataStatus: area.worstQuality === 'Good' ? 'Recorded' : 'Estimated',
      })
    })
  }

  const totalEmissions = carbonRecords.reduce((sum, r) => sum + r.emissionsTCO2e, 0)
  const totalMWh = energyRecords.reduce((sum, r) => sum + r.consumptionMWh, 0)
  const tonnes = Math.max(1, Math.round(totalMWh * TONNES_PER_MWH))
  const intensity = tonnes > 0 ? totalEmissions / tonnes : 0
  const dominantArea = areas.reduce(
    (best, area) => (area.readingsPerHour > best.readingsPerHour ? area : best),
    areas[0] ?? { area: 'Production Line', readingsPerHour: 0, uptimePct: 0, worstQuality: 'Good' as DataQuality, deviceCount: 0 }
  )
  const commodityId = AREA_TO_COMMODITY[dominantArea.area] ?? cbamCommodities[0].id
  const onlineCount = fleetDevices.filter((d) => d.status === 'Online').length
  const degradedCount = fleetDevices.filter((d) => d.dataQuality !== 'Good').length

  return {
    id: now.toISOString(),
    generatedAt: now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    generatedAtISO: now.toISOString(),
    plant: NODE_PLANT,
    commodityId,
    tonnes,
    intensity: Math.round(intensity * 100) / 100,
    energyRecords,
    carbonRecords,
    deviceCount: fleetDevices.length,
    onlineCount,
    degradedCount,
    totalReadingsPerHour,
    sourceLabel: `Node IoT JEJAK • ${onlineCount}/${fleetDevices.length} perangkat aktif • ${totalReadingsPerHour} pembacaan/jam`,
  }
}

export function snapshotToCbamInput(snapshot: NodeReportSnapshot) {
  return {
    commodityId: snapshot.commodityId,
    tonnes: snapshot.tonnes,
    intensity: snapshot.intensity,
  }
}
