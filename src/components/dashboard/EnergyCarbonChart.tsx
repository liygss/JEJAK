import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, CalendarDays, Gauge, TriangleAlert, Activity, PiggyBank } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { energyRecords } from '../../data/energy'
import { carbonRecords as carbonData } from '../../data/carbon'
import { useFilters } from '../../lib/FiltersContext'
import {
  calculateRealizedSavings,
  countAboveBaseline,
  getDailyCarbonSeries,
  getDailyEnergySeries,
  getEfficiencyScore,
  getPeakDay,
  getTrendDelta,
} from '../../lib/calculations'
import { formatCurrencyIDRCompact, formatMWh, formatTCO2e } from '../../lib/formatters'

type ViewMode = 'Energy' | 'Carbon' | 'Combined'

const modes: ViewMode[] = ['Energy', 'Carbon', 'Combined']

const MODE_LABEL: Record<ViewMode, string> = {
  Energy: 'Energi',
  Carbon: 'Karbon',
  Combined: 'Gabungan',
}

type TooltipEntry = { dataKey?: string | number; name?: string; value?: number | string; color?: string }
type ChartTooltipProps = { active?: boolean; payload?: TooltipEntry[]; label?: string | number }

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-12 border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-main-text">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-secondary-text">{entry.name}:</span>
          <span className="font-medium text-main-text">
            {entry.dataKey === 'carbon'
              ? `${Number(entry.value).toFixed(2)} tCO₂e`
              : `${Number(entry.value).toFixed(2)} MWh`}
          </span>
        </div>
      ))}
    </div>
  )
}

const TrendBadge = ({ value }: { value: number }) => {
  const up = value > 0.5
  const down = value < -0.5
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus
  const color = down ? 'text-primary-green' : up ? 'text-warning' : 'text-secondary-text'
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}>
      <Icon size={13} />
      {`${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
    </span>
  )
}

const EnergyCarbonChart = () => {
  const { filterEnergy, filterCarbon } = useFilters()
  const reduce = useReducedMotion()
  const [view, setView] = useState<ViewMode>('Combined')

  const data = useMemo(() => {
    const energy = filterEnergy(energyRecords)
    const carbon = filterCarbon(carbonData)

    const dailyEnergy = energy.reduce((acc, record) => {
      acc[record.timestamp] = (acc[record.timestamp] ?? 0) + record.consumptionMWh
      return acc
    }, {} as Record<string, number>)

    const dailyBaseline = energy.reduce((acc, record) => {
      acc[record.timestamp] = (acc[record.timestamp] ?? 0) + record.baselineMWh
      return acc
    }, {} as Record<string, number>)

    const dailyCarbon = carbon.reduce((acc, record) => {
      acc[record.timestamp] = (acc[record.timestamp] ?? 0) + record.emissionsTCO2e
      return acc
    }, {} as Record<string, number>)

    const sortedDates = Array.from(new Set([...Object.keys(dailyEnergy), ...Object.keys(dailyCarbon)])).sort()

    return sortedDates.map((date) => ({
      date: new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
      energy: Number((dailyEnergy[date] ?? 0).toFixed(2)),
      baseline: Number((dailyBaseline[date] ?? 0).toFixed(2)),
      carbon: Number((dailyCarbon[date] ?? 0).toFixed(2)),
    }))
  }, [filterEnergy, filterCarbon])

  const baselineAvg =
    data.length > 0 ? data.reduce((s, d) => s + d.baseline, 0) / data.length : 0

  const showEnergy = view === 'Energy' || view === 'Combined'
  const showCarbon = view === 'Carbon' || view === 'Combined'

  const metrics = useMemo(() => {
    const energy = filterEnergy(energyRecords)
    const carbon = filterCarbon(carbonData)
    const energySeries = getDailyEnergySeries(energy)
    const carbonSeries = getDailyCarbonSeries(carbon)
    const avgEnergy = energySeries.length ? energySeries.reduce((s, d) => s + d.value, 0) / energySeries.length : 0
    const avgCarbon = carbonSeries.length ? carbonSeries.reduce((s, d) => s + d.value, 0) / carbonSeries.length : 0
    return {
      avgEnergy,
      avgCarbon,
      energyDelta: getTrendDelta(energySeries),
      carbonDelta: getTrendDelta(carbonSeries),
      efficiency: getEfficiencyScore(energy),
      aboveBaseline: countAboveBaseline(energy),
      peak: getPeakDay(energy),
      realizedSavings: calculateRealizedSavings(energy),
    }
  }, [filterEnergy, filterCarbon])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6"
    >
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-lg font-semibold text-main-text">Tren Energi &amp; Karbon</h3>
          <p className="text-xs text-secondary-text">Tampilan gabungan memakai dua sumbu Y terpisah</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-secondary-text">
              <span className="h-2 w-2 rounded-full bg-teal-accent" /> Energi
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-secondary-text">
              <span className="h-2 w-2 rounded-full bg-primary-green" /> Karbon
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-secondary-text">
              <span className="h-0.5 w-4 rounded-full bg-warning" /> Rata-rata baseline
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-12 bg-main-bg p-1">
          {modes.map((mode) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`relative rounded-10 px-3 py-1.5 text-sm font-medium transition-colors ${
                view === mode ? 'text-main-text' : 'text-secondary-text hover:text-main-text'
              }`}
            >
              {view === mode && !reduce && (
                <motion.span
                  layoutId="chart-view-pill"
                  className="absolute inset-0 rounded-10 bg-surface shadow-sm"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              {view === mode && reduce && <span className="absolute inset-0 rounded-10 bg-surface shadow-sm" />}
              <span className="relative z-10">{MODE_LABEL[mode]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-12 border border-border bg-main-bg/50 px-3 py-2">
          <p className="text-[11px] text-secondary-text">Rata-rata Energi</p>
          <div className="mt-0.5 flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-main-text">{formatMWh(metrics.avgEnergy)}</span>
            <TrendBadge value={metrics.energyDelta} />
          </div>
        </div>
        <div className="rounded-12 border border-border bg-main-bg/50 px-3 py-2">
          <p className="text-[11px] text-secondary-text">Rata-rata Karbon</p>
          <div className="mt-0.5 flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-main-text">{formatTCO2e(metrics.avgCarbon)}</span>
            <TrendBadge value={metrics.carbonDelta} />
          </div>
        </div>
        <div className="rounded-12 border border-border bg-main-bg/50 px-3 py-2">
          <p className="text-[11px] text-secondary-text">Skor Efisiensi</p>
          <div className="mt-0.5 flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-main-text">{metrics.efficiency}%</span>
            <span className="text-[11px] text-secondary-text">baseline</span>
          </div>
        </div>
        <div className="rounded-12 border border-border bg-main-bg/50 px-3 py-2">
          <p className="text-[11px] text-secondary-text">Di Atas Baseline</p>
          <div className="mt-0.5 flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-main-text">{metrics.aboveBaseline} hari</span>
            <span className="text-[11px] text-secondary-text">periode ini</span>
          </div>
        </div>
      </div>

      <div className="h-64 flex-1 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="carbonFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-secondary-text)" tick={{ fontSize: 12 }} />
            {showEnergy && (
              <YAxis
                yAxisId="energy"
                orientation="left"
                stroke="var(--color-teal-accent)"
                tick={{ fontSize: 12 }}
                label={{ value: 'Energi (MWh)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'var(--color-secondary-text)' } }}
              />
            )}
            {showCarbon && (
              <YAxis
                yAxisId="carbon"
                orientation="right"
                stroke="var(--color-primary-green)"
                tick={{ fontSize: 12 }}
                label={{ value: 'Karbon (tCO₂e)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: 'var(--color-secondary-text)' } }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {showEnergy && (
              <ReferenceLine
                yAxisId="energy"
                y={baselineAvg}
                stroke="var(--color-warning)"
                strokeDasharray="5 4"
                label={{ value: 'Rata-rata baseline', position: 'insideTopRight', fontSize: 10, fill: 'var(--color-warning)' }}
              />
            )}
            {showEnergy && (
              <Area
                yAxisId="energy"
                type="monotone"
                dataKey="energy"
                stroke="var(--color-teal-accent)"
                strokeWidth={2.5}
                fill="url(#energyFill)"
                name="Energi (MWh)"
              />
            )}
            {showCarbon && (
              <Area
                yAxisId="carbon"
                type="monotone"
                dataKey="carbon"
                stroke="var(--color-primary-green)"
                strokeWidth={2.5}
                fill="url(#carbonFill)"
                name="Karbon (tCO₂e)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insight panel */}
      <div className="mt-5 border-t border-border pt-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-10 bg-teal-50 text-deep-teal">
              <CalendarDays size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-secondary-text">Hari puncak</p>
              <p className="truncate text-sm font-semibold text-main-text">
                {metrics.peak ? formatMWh(metrics.peak.consumptionMWh) : '—'}
              </p>
              <p className="truncate text-[11px] text-secondary-text">
                {metrics.peak ? metrics.peak.date : 'Tidak ada data'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
              <Gauge size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-secondary-text">Skor efisiensi</p>
              <p className="text-sm font-semibold text-main-text">{metrics.efficiency}%</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-main-bg">
                <div
                  className="h-full rounded-full bg-primary-green transition-all duration-700"
                  style={{ width: `${metrics.efficiency}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-10 bg-amber-50 text-warning">
              {metrics.aboveBaseline > 0 ? <TriangleAlert size={16} /> : <Activity size={16} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-secondary-text">Pembacaan di atas baseline</p>
              <p className="text-sm font-semibold text-main-text">{metrics.aboveBaseline} hari</p>
              <p className="truncate text-[11px] text-secondary-text">Periode yang dipilih</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
              <PiggyBank size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-secondary-text">Estimasi sudah dihemat</p>
              <p className="text-sm font-semibold text-main-text">
                {formatCurrencyIDRCompact(metrics.realizedSavings)}
              </p>
              <p className="truncate text-[11px] text-secondary-text">vs baseline</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default EnergyCarbonChart
