import type { FuelCategory, FuelType, FuelUnit } from './types'

export type FuelFactor = {
  type: FuelType
  label: string
  category: FuelCategory
  unit: FuelUnit
  ncvGJPerUnit: number
  efTCO2PerTJ: number
  equipment: string
}

export const FUEL_FACTOR_NOTE =
  'Nilai NCV dan faktor emisi bersifat ilustratif untuk demonstrasi, bukan nilai regulasi resmi. Perbarui konfigurasi sebelum dipakai untuk pelaporan.'

export const FUEL_FACTORS: Record<FuelType, FuelFactor> = {
  Diesel: {
    type: 'Diesel',
    label: 'Solar / Diesel',
    category: 'Liquid',
    unit: 'L',
    ncvGJPerUnit: 0.036,
    efTCO2PerTJ: 74.1,
    equipment: 'Genset',
  },
  MFO: {
    type: 'MFO',
    label: 'MFO',
    category: 'Liquid',
    unit: 'L',
    ncvGJPerUnit: 0.041,
    efTCO2PerTJ: 77.4,
    equipment: 'Boiler',
  },
  NaturalGas: {
    type: 'NaturalGas',
    label: 'Gas Alam / PGN',
    category: 'Gas',
    unit: 'm³',
    ncvGJPerUnit: 0.039,
    efTCO2PerTJ: 56.1,
    equipment: 'Furnace',
  },
  LPG: {
    type: 'LPG',
    label: 'LPG',
    category: 'Gas',
    unit: 'kg',
    ncvGJPerUnit: 0.046,
    efTCO2PerTJ: 63.1,
    equipment: 'Furnace',
  },
  CNG: {
    type: 'CNG',
    label: 'CNG',
    category: 'Gas',
    unit: 'm³',
    ncvGJPerUnit: 0.036,
    efTCO2PerTJ: 56.1,
    equipment: 'Boiler',
  },
  Coal: {
    type: 'Coal',
    label: 'Batubara',
    category: 'Solid',
    unit: 'ton',
    ncvGJPerUnit: 23,
    efTCO2PerTJ: 94.6,
    equipment: 'Boiler',
  },
  Biomass: {
    type: 'Biomass',
    label: 'Biomassa',
    category: 'Solid',
    unit: 'ton',
    ncvGJPerUnit: 18,
    efTCO2PerTJ: 1.5,
    equipment: 'Furnace',
  },
}

export const FUEL_TYPES = Object.keys(FUEL_FACTORS) as FuelType[]

export const FUEL_CATEGORIES: FuelCategory[] = ['Liquid', 'Gas', 'Solid']

export function isFuelType(value: unknown): value is FuelType {
  return typeof value === 'string' && value in FUEL_FACTORS
}
