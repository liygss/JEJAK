import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { buildNodeSnapshot, type NodeReportSnapshot } from './nodeReportData'

const HISTORY_KEY = 'jejak-node-cbam-history'
const AUTO_KEY = 'jejak-node-cbam-auto'
const INTERVAL_KEY = 'jejak-node-cbam-interval'
const MAX_HISTORY = 8

export type NodeHistoryEntry = Pick<
  NodeReportSnapshot,
  'id' | 'generatedAt' | 'generatedAtISO' | 'tonnes' | 'intensity' | 'commodityId' | 'deviceCount' | 'sourceLabel'
>

type NodeReportContextValue = {
  snapshot: NodeReportSnapshot
  history: NodeHistoryEntry[]
  autoEnabled: boolean
  intervalMs: number
  setAutoEnabled: (value: boolean) => void
  setIntervalMs: (value: number) => void
  syncNow: () => NodeReportSnapshot
  clearHistory: () => void
}

export const NODE_INTERVAL_OPTIONS = [
  { label: '1 menit', value: 60_000 },
  { label: '5 menit', value: 300_000 },
  { label: '15 menit', value: 900_000 },
] as const

const NodeReportContext = createContext<NodeReportContextValue | null>(null)

function toEntry(snapshot: NodeReportSnapshot): NodeHistoryEntry {
  return {
    id: snapshot.id,
    generatedAt: snapshot.generatedAt,
    generatedAtISO: snapshot.generatedAtISO,
    tonnes: snapshot.tonnes,
    intensity: snapshot.intensity,
    commodityId: snapshot.commodityId,
    deviceCount: snapshot.deviceCount,
    sourceLabel: snapshot.sourceLabel,
  }
}

function readHistory(): NodeHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as NodeHistoryEntry[]).slice(0, MAX_HISTORY) : []
  } catch {
    return []
  }
}

function readAuto(): boolean {
  try {
    return window.localStorage.getItem(AUTO_KEY) === 'true'
  } catch {
    return false
  }
}

function readInterval(): number {
  try {
    const value = Number(window.localStorage.getItem(INTERVAL_KEY))
    return NODE_INTERVAL_OPTIONS.some((o) => o.value === value) ? value : NODE_INTERVAL_OPTIONS[0].value
  } catch {
    return NODE_INTERVAL_OPTIONS[0].value
  }
}

export function NodeReportProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<NodeReportSnapshot>(() => buildNodeSnapshot())
  const [history, setHistory] = useState<NodeHistoryEntry[]>(() => {
    const stored = readHistory()
    return stored.length > 0 ? stored : [toEntry(snapshot)]
  })
  const [autoEnabled, setAutoEnabled] = useState<boolean>(readAuto)
  const [intervalMs, setIntervalMs] = useState<number>(readInterval)

  const syncNow = useCallback(() => {
    const next = buildNodeSnapshot()
    setSnapshot(next)
    setHistory((prev) => [toEntry(next), ...prev].slice(0, MAX_HISTORY))
    return next
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])

  useEffect(() => {
    if (!autoEnabled) return
    const timer = window.setInterval(() => {
      syncNow()
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [autoEnabled, intervalMs, syncNow])

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
      window.localStorage.setItem(AUTO_KEY, String(autoEnabled))
      window.localStorage.setItem(INTERVAL_KEY, String(intervalMs))
    } catch {
      return
    }
  }, [history, autoEnabled, intervalMs])

  const value = useMemo<NodeReportContextValue>(
    () => ({
      snapshot,
      history,
      autoEnabled,
      intervalMs,
      setAutoEnabled,
      setIntervalMs,
      syncNow,
      clearHistory,
    }),
    [snapshot, history, autoEnabled, intervalMs, syncNow, clearHistory]
  )

  return <NodeReportContext.Provider value={value}>{children}</NodeReportContext.Provider>
}

export function useNodeReport() {
  const ctx = useContext(NodeReportContext)
  if (!ctx) throw new Error('useNodeReport must be used within NodeReportProvider')
  return ctx
}
