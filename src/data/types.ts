export type PlantOption = 'Manufacturing Plant A' | 'Manufacturing Plant B'

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
