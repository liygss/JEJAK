export type PlantOption = 'Manufacturing Plant A' | 'Manufacturing Plant B'

export type FuelType = 'Diesel' | 'MFO' | 'NaturalGas' | 'LPG' | 'CNG' | 'Coal' | 'Biomass'

export type FuelCategory = 'Liquid' | 'Gas' | 'Solid'

export type FuelUnit = 'L' | 'm³' | 'kg' | 'ton'

export type FuelRecord = {
  id: string
  timestamp: string
  plant: PlantOption
  fuelType: FuelType
  category: FuelCategory
  quantity: number
  unit: FuelUnit
  equipment: string
  source: 'IoT Simulation' | 'Manual Entry'
  dataStatus: 'Estimated' | 'Recorded'
  ncvGJPerUnit: number
  efTCO2PerTJ: number
  emissionsTCO2e: number
  note?: string
}

export type EnergyRecord = {
  timestamp: string
  plant: PlantOption
  area: string
  consumptionMWh: number
  baselineMWh: number
  costIDR: number
  source: 'IoT Simulation' | 'Manual Entry'
}

export type CarbonRecord = {
  timestamp: string
  plant: PlantOption
  source: string
  scope: 'Scope 1' | 'Scope 2'
  emissionsTCO2e: number
  dataStatus: 'Estimated' | 'Recorded'
}

export type Insight = {
  id: string
  title: string
  description: string
  severity: 'Low' | 'Medium' | 'High'
  area: string
  estimatedSavingsIDR?: number
  status: 'New' | 'Reviewed'
}

export type Device = {
  id: string
  name: string
  location: string
  status: 'Online' | 'Warning' | 'Offline'
  lastUpdate: string
}
