import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { energyRecords } from '../../data/energy'
import { useFilters } from '../../lib/FiltersContext'
import { getAreaStats } from '../../lib/calculations'
import { formatCurrencyIDR, formatMWh } from '../../lib/formatters'
import { areaLabel } from '../../lib/id'

const COLORS = ['#059669', '#14B8A6', '#0F766E', '#5EEAD4', '#99F6E4']

type PieEntry = { name?: string; value?: number; payload?: { area: string; share: number } }

const DonutTooltip = ({ active, payload }: { active?: boolean; payload?: PieEntry[] }) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-12 border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-main-text">{item.payload ? areaLabel(item.payload.area) : ''}</p>
      <p className="text-secondary-text">
        {Number(item.value).toFixed(1)} MWh • {item.payload?.share.toFixed(1)}%
      </p>
    </div>
  )
}

const EnergyBreakdown = () => {
  const { filterEnergy } = useFilters()
  const { stats, total } = useMemo(() => {
    const records = filterEnergy(energyRecords)
    return {
      stats: getAreaStats(records),
      total: records.reduce((s, r) => s + r.consumptionMWh, 0),
    }
  }, [filterEnergy])
  const top = stats[0]

  const pieData = stats.map((s) => ({
    name: s.area,
    value: Number(s.consumptionMWh.toFixed(1)),
    area: s.area,
    share: s.share,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6"
    >
      <h3 className="mb-1 text-lg font-semibold text-main-text">Rincian Energi</h3>
      <p className="mb-3 text-xs text-secondary-text">Berdasarkan area terpantau</p>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
                stroke="none"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wide text-secondary-text">Total</span>
            <span className="text-sm font-bold text-main-text">{total.toFixed(1)} MWh</span>
          </div>
        </div>

        <ul className="w-full flex-1 space-y-2">
          {stats.map((s, i) => (
            <li key={s.area} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate font-medium text-main-text">{areaLabel(s.area)}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-right">
                <span className="text-secondary-text">{s.share.toFixed(0)}%</span>
                <span className="tabular-nums font-medium text-main-text">{formatCurrencyIDR(s.costIDR)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs text-secondary-text">
        {top
          ? `Konsumsi tertinggi: ${areaLabel(top.area)} (${formatMWh(top.consumptionMWh)}).`
          : 'Tidak ada data untuk filter yang dipilih.'}
      </p>
    </motion.div>
  )
}

export default EnergyBreakdown
