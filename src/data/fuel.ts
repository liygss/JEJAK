import type { FuelRecord, FuelType, PlantOption } from './types'
import { FUEL_FACTORS } from './fuelFactors'

export const DEMO_DATES = Array.from({ length: 20 }, (_, index) => {
  const date = new Date('2025-09-20T00:00:00Z')
  date.setUTCDate(date.getUTCDate() + index)
  return date.toISOString().slice(0, 10)
})

export const LATEST_FUEL_DATE = DEMO_DATES[DEMO_DATES.length - 1]
export const DEMO_MIN_DATE = DEMO_DATES[0]

const PLANTS: PlantOption[] = ['Manufacturing Plant A', 'Manufacturing Plant B']

type DemoFuel = { fuelType: FuelType; base: number; every: number }

const DEMO_FUELS: DemoFuel[] = [
  { fuelType: 'Diesel', base: 120, every: 1 },
  { fuelType: 'NaturalGas', base: 850, every: 1 },
  { fuelType: 'Coal', base: 3.2, every: 3 },
  { fuelType: 'Biomass', base: 2.5, every: 4 },
]

function round(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export const fuelRecords: FuelRecord[] = PLANTS.flatMap((plant, plantIndex) =>
  DEMO_FUELS.flatMap((item, itemIndex) => {
    const factor = FUEL_FACTORS[item.fuelType]
    return DEMO_DATES.flatMap((timestamp, dayIndex) => {
      if (dayIndex % item.every !== 0) return []
      const variation = 0.9 + 0.12 * Math.sin(dayIndex / 2.5 + itemIndex)
      const scale = plantIndex === 0 ? 1 : 0.85
      const quantity = round(item.base * variation * scale, item.base >= 100 ? 0 : 1)
      const source = dayIndex % 5 === 0 ? 'Manual Entry' : 'IoT Simulation'
      const ncvGJPerUnit = factor.ncvGJPerUnit
      const efTCO2PerTJ = factor.efTCO2PerTJ
      return [
        {
          id: `demo-fuel-${plantIndex}-${itemIndex}-${dayIndex}`,
          timestamp,
          plant,
          fuelType: item.fuelType,
          category: factor.category,
          quantity,
          unit: factor.unit,
          equipment: factor.equipment,
          source,
          dataStatus: 'Recorded' as const,
          ncvGJPerUnit,
          efTCO2PerTJ,
          emissionsTCO2e: round((quantity * ncvGJPerUnit * efTCO2PerTJ) / 1000, 3),
        },
      ]
    })
  })
)
