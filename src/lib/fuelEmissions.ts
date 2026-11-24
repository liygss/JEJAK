import type { CarbonRecord, FuelRecord, FuelType, PlantOption } from '../data/types'
import { FUEL_FACTORS } from '../data/fuelFactors'
import type { DailySeries } from './calculations'

export type FuelInput = {
  id?: string
  timestamp: string
  plant: PlantOption
  fuelType: FuelType
  quantity: number
  equipment?: string
  source: FuelRecord['source']
  dataStatus: FuelRecord['dataStatus']
  note?: string
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function calculateEmissionsTCO2e(quantity: number, fuelType: FuelType): number {
  const factor = FUEL_FACTORS[fuelType]
  return round((quantity * factor.ncvGJPerUnit * factor.efTCO2PerTJ) / 1000, 3)
}

export function createFuelRecord(input: FuelInput): FuelRecord {
  const factor = FUEL_FACTORS[input.fuelType]
  return {
    id: input.id ?? `fuel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: input.timestamp,
    plant: input.plant,
    fuelType: input.fuelType,
    category: factor.category,
    quantity: round(input.quantity, 3),
    unit: factor.unit,
    equipment: input.equipment?.trim() || factor.equipment,
    source: input.source,
    dataStatus: input.dataStatus,
    ncvGJPerUnit: factor.ncvGJPerUnit,
    efTCO2PerTJ: factor.efTCO2PerTJ,
    emissionsTCO2e: calculateEmissionsTCO2e(input.quantity, input.fuelType),
    note: input.note?.trim() || undefined,
  }
}

export function calculateFuelEmissions(records: FuelRecord[]): number {
  return records.reduce((sum, record) => sum + record.emissionsTCO2e, 0)
}

export function calculateFuelEnergyGJ(records: FuelRecord[]): number {
  return records.reduce((sum, record) => sum + record.quantity * record.ncvGJPerUnit, 0)
}

export type FuelBreakdown = {
  fuelType: FuelType
  label: string
  category: FuelRecord['category']
  quantity: number
  unit: FuelRecord['unit']
  emissionsTCO2e: number
}

export function getFuelBreakdown(records: FuelRecord[]): FuelBreakdown[] {
  const map = new Map<FuelType, FuelBreakdown>()
  records.forEach((record) => {
    const current = map.get(record.fuelType) ?? {
      fuelType: record.fuelType,
      label: FUEL_FACTORS[record.fuelType].label,
      category: record.category,
      quantity: 0,
      unit: record.unit,
      emissionsTCO2e: 0,
    }
    current.quantity += record.quantity
    current.emissionsTCO2e += record.emissionsTCO2e
    map.set(record.fuelType, current)
  })
  return Array.from(map.values())
    .map((item) => ({
      ...item,
      quantity: round(item.quantity, 2),
      emissionsTCO2e: round(item.emissionsTCO2e, 3),
    }))
    .sort((a, b) => b.emissionsTCO2e - a.emissionsTCO2e)
}

export function getDailyFuelSeries(records: FuelRecord[]): DailySeries[] {
  const byDay = records.reduce((acc, record) => {
    acc[record.timestamp] = (acc[record.timestamp] ?? 0) + record.emissionsTCO2e
    return acc
  }, {} as Record<string, number>)
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value: round(value, 3) }))
}

export function fuelToCarbonRecords(records: FuelRecord[]): CarbonRecord[] {
  return records.map((record) => ({
    timestamp: record.timestamp,
    plant: record.plant,
    source: FUEL_FACTORS[record.fuelType].label,
    scope: 'Scope 1',
    emissionsTCO2e: record.emissionsTCO2e,
    dataStatus: record.dataStatus,
  }))
}
