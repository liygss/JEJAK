import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CarbonRecord, FuelRecord } from '../data/types'
import { carbonRecords } from '../data/carbon'
import { fuelRecords } from '../data/fuel'
import { isFuelType } from '../data/fuelFactors'
import { createFuelRecord, fuelToCarbonRecords, type FuelInput } from './fuelEmissions'

const STORAGE_KEY = 'jejak_fuel_log_v1'

type FuelLogContextValue = {
  records: FuelRecord[]
  manualRecords: FuelRecord[]
  addRecord: (input: FuelInput) => FuelRecord
  removeRecord: (id: string) => void
}

function isFuelRecord(value: unknown): value is FuelRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.timestamp === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.timestamp) &&
    (record.plant === 'Manufacturing Plant A' || record.plant === 'Manufacturing Plant B') &&
    isFuelType(record.fuelType) &&
    typeof record.quantity === 'number' &&
    record.quantity > 0 &&
    (record.source === 'IoT Simulation' || record.source === 'Manual Entry') &&
    (record.dataStatus === 'Estimated' || record.dataStatus === 'Recorded')
  )
}

function readManualRecords(): FuelRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isFuelRecord).map((record) =>
      createFuelRecord({
        id: record.id,
        timestamp: record.timestamp,
        plant: record.plant,
        fuelType: record.fuelType,
        quantity: record.quantity,
        equipment: typeof record.equipment === 'string' ? record.equipment : undefined,
        source: record.source,
        dataStatus: record.dataStatus,
        note: typeof record.note === 'string' ? record.note : undefined,
      })
    )
  } catch {
    return []
  }
}

const FuelLogContext = createContext<FuelLogContextValue | null>(null)

export function FuelLogProvider({ children }: { children: ReactNode }) {
  const [manualRecords, setManualRecords] = useState<FuelRecord[]>(readManualRecords)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(manualRecords))
    } catch {
      return
    }
  }, [manualRecords])

  const addRecord = useCallback((input: FuelInput) => {
    const record = createFuelRecord(input)
    setManualRecords((prev) => [record, ...prev])
    return record
  }, [])

  const removeRecord = useCallback((id: string) => {
    setManualRecords((prev) => prev.filter((record) => record.id !== id))
  }, [])

  const records = useMemo(() => [...fuelRecords, ...manualRecords], [manualRecords])

  const value = useMemo<FuelLogContextValue>(
    () => ({ records, manualRecords, addRecord, removeRecord }),
    [records, manualRecords, addRecord, removeRecord]
  )

  return <FuelLogContext.Provider value={value}>{children}</FuelLogContext.Provider>
}

export function useFuelLog() {
  const ctx = useContext(FuelLogContext)
  if (!ctx) throw new Error('useFuelLog must be used within FuelLogProvider')
  return ctx
}

export function useCombinedCarbon(): CarbonRecord[] {
  const { records } = useFuelLog()
  return useMemo(() => [...carbonRecords, ...fuelToCarbonRecords(records)], [records])
}
