import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CarbonRecord, EnergyRecord, PlantOption } from '../data/types'

export type { PlantOption }

export type PeriodOption = 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days'

type FiltersContextValue = {
  plant: PlantOption
  setPlant: (p: PlantOption) => void
  period: PeriodOption
  setPeriod: (p: PeriodOption) => void
  filterEnergy: (records: EnergyRecord[]) => EnergyRecord[]
  filterCarbon: (records: CarbonRecord[]) => CarbonRecord[]
  loading: boolean
  refresh: () => void
  lastUpdated: string
}

const periodDays: Record<PeriodOption, number> = {
  'Last 7 Days': 7,
  'Last 30 Days': 30,
  'Last 90 Days': 90,
}

const FiltersContext = createContext<FiltersContextValue | null>(null)

function referenceDate(records: { timestamp: string }[]) {
  const max = records.reduce((acc, r) => (r.timestamp > acc ? r.timestamp : acc), '')
  return max ? new Date(max) : new Date()
}

function withinPeriod<T extends { timestamp: string }>(records: T[], period: PeriodOption, ref: Date): T[] {
  const days = periodDays[period]
  const start = new Date(ref)
  start.setDate(start.getDate() - days)
  return records.filter((r) => new Date(r.timestamp) >= start)
}

function nowLabel() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [plant, setPlant] = useState<PlantOption>('Manufacturing Plant A')
  const [period, setPeriod] = useState<PeriodOption>('Last 30 Days')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(nowLabel)

  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => {
      setLoading(false)
      setLastUpdated(nowLabel())
    }, 450)
    return () => window.clearTimeout(timer)
  }, [plant, period, refreshKey])

  // Stable identities: these only change when plant/period change, NOT when
  // loading/lastUpdated change. This prevents downstream useMemo/Recharts from
  // re-computing (and re-animating) on every refresh tick or keystroke.
  const filterEnergy = useCallback(
    (records: EnergyRecord[]) => {
      const forPlant = records.filter((r) => r.plant === plant)
      return withinPeriod(forPlant, period, referenceDate(forPlant))
    },
    [plant, period]
  )

  const filterCarbon = useCallback(
    (records: CarbonRecord[]) => {
      const forPlant = records.filter((r) => r.plant === plant)
      return withinPeriod(forPlant, period, referenceDate(forPlant))
    },
    [plant, period]
  )

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const value = useMemo<FiltersContextValue>(
    () => ({
      plant,
      setPlant,
      period,
      setPeriod,
      filterEnergy,
      filterCarbon,
      loading,
      refresh,
      lastUpdated,
    }),
    [plant, period, filterEnergy, filterCarbon, loading, refresh, lastUpdated]
  )

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
}

export function useFilters() {
  const ctx = useContext(FiltersContext)
  if (!ctx) throw new Error('useFilters must be used within FiltersProvider')
  return ctx
}
