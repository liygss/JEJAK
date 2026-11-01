import { useMemo, useState } from 'react'
import { Zap, Activity, DollarSign, Search, ArrowUpDown, Inbox } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend } from 'recharts'
import AppHeader from '../components/layout/AppHeader'
import { useSidebar } from '../components/layout/DashboardLayout'
import KpiCard from '../components/dashboard/KpiCard'
import { Stagger, StaggerItem } from '../components/ui/Reveal'
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton'
import { energyRecords } from '../data/energy'
import { useFilters } from '../lib/FiltersContext'
import { formatCurrencyIDR, formatMWh } from '../lib/formatters'
import { calculateTotalEnergy, calculateTotalCost } from '../lib/calculations'
import { areaLabel, ENERGY_SOURCE_LABEL } from '../lib/id'

type SortKey = 'timestamp' | 'area' | 'consumptionMWh'

const EnergyPage = () => {
  const { openSidebar } = useSidebar()
  const { filterEnergy, plant, period, loading } = useFilters()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState('All')
  const [sortKey, setSortKey] = useState<SortKey>('timestamp')
  const [sortAsc, setSortAsc] = useState(false)
  const [onlyAboveBaseline, setOnlyAboveBaseline] = useState(false)

  const periodData = useMemo(() => filterEnergy(energyRecords), [filterEnergy])
  const areas = Array.from(new Set(periodData.map((r) => r.area)))

  const totalEnergy = calculateTotalEnergy(periodData)
  const totalCost = calculateTotalCost(periodData)
  const avgDaily = periodData.length ? totalEnergy / new Set(periodData.map((r) => r.timestamp)).size : 0

  const rows = useMemo(() => {
    const filtered = periodData
      .filter((r) => selectedArea === 'All' || r.area === selectedArea)
      .filter((r) => onlyAboveBaseline ? r.consumptionMWh > r.baselineMWh : true)
      .filter(
        (r) =>
          r.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.timestamp.includes(searchTerm)
      )
    return filtered.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'consumptionMWh') cmp = a.consumptionMWh - b.consumptionMWh
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]))
      return sortAsc ? cmp : -cmp
    })
  }, [periodData, selectedArea, searchTerm, sortKey, sortAsc, onlyAboveBaseline])

  const trendData = useMemo(() => {
    const byDay = periodData.reduce((acc, r) => {
      if (!acc[r.timestamp]) acc[r.timestamp] = { consumption: 0, baseline: 0 }
      acc[r.timestamp].consumption += r.consumptionMWh
      acc[r.timestamp].baseline += r.baselineMWh
      return acc
    }, {} as Record<string, { consumption: number; baseline: number }>)
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date: new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
        consumption: Number(v.consumption.toFixed(2)),
        baseline: Number(v.baseline.toFixed(2)),
      }))
  }, [periodData])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v)
    else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  return (
    <>
      <AppHeader
        title="Pemantauan Energi"
        subtitle="Pantau pola konsumsi dan identifikasi potensi pemborosan"
        onMenuClick={openSidebar}
      />
      <main className="space-y-6 p-4 md:p-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <StaggerItem>
              <KpiCard
                title="Total Konsumsi Energi"
                value={formatMWh(totalEnergy)}
                numericValue={totalEnergy}
                format={(n) => formatMWh(n)}
                icon={Zap}
                tooltip={`Total untuk ${period} di ${plant}.`}
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Rata-rata Pemakaian Harian"
                value={formatMWh(avgDaily, 2)}
                numericValue={avgDaily}
                format={(n) => formatMWh(n, 2)}
                icon={Activity}
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Total Biaya Energi"
                value={formatCurrencyIDR(totalCost)}
                numericValue={totalCost}
                format={(n) => formatCurrencyIDR(n)}
                icon={DollarSign}
              />
            </StaggerItem>
          </Stagger>
        )}

        <div className="bg-surface rounded-18 border border-border p-4 md:p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-main-text">Pemakaian Energi Seiring Waktu</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-secondary-text)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--color-secondary-text)" tick={{ fontSize: 12 }} label={{ value: 'MWh', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'var(--color-secondary-text)' } }} />
                <RTooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="consumption" stroke="var(--color-teal-accent)" strokeWidth={2} name="Konsumsi (MWh)" dot={false} />
                <Line type="monotone" dataKey="baseline" stroke="var(--color-secondary-text)" strokeWidth={1.5} strokeDasharray="4 4" name="Baseline (MWh)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface rounded-18 border border-border shadow-sm">
          <div className="border-b border-border p-4 md:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h3 className="text-lg font-semibold text-main-text">Data Konsumsi Energi</h3>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type="text"
                    placeholder="Cari area atau tanggal..."
                    className="w-full rounded-12 border border-border py-2 pl-9 pr-3 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20 sm:w-56"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="rounded-12 border border-border px-3 py-2 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <option value="All">Semua Area</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {areaLabel(area)}
                    </option>
                  ))}
                </select>
                <label className="inline-flex items-center gap-2 rounded-12 border border-border px-3 py-2 text-sm text-secondary-text">
                  <input
                    type="checkbox"
                    checked={onlyAboveBaseline}
                    onChange={(e) => setOnlyAboveBaseline(e.target.checked)}
                    className="accent-primary-green"
                  />
                  Di atas baseline
                </label>
              </div>
            </div>
            <p className="mt-2 text-xs text-secondary-text">
              *Nilai baseline adalah nilai acuan untuk menilai konsumsi di atas atau di bawah target.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-border bg-main-bg">
                  <Th label="Waktu" onClick={() => toggleSort('timestamp')} />
                  <Th label="Area" onClick={() => toggleSort('area')} />
                  <Th label="Konsumsi" align="right" onClick={() => toggleSort('consumptionMWh')} />
                  <Th label="Baseline" align="right" />
                  <Th label="Status" align="center" />
                  <Th label="Sumber Data" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-6 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16">
                      <div className="flex flex-col items-center text-center">
                        <Inbox size={28} className="text-secondary-text/50" />
                        <p className="mt-3 text-sm text-secondary-text">Tidak ada catatan yang cocok dengan filter Anda.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((record, index) => {
                    const above = record.consumptionMWh > record.baselineMWh
                    return (
                      <tr key={index} className="transition-colors hover:bg-main-bg/50">
                        <td className="px-6 py-3 text-sm text-main-text">{record.timestamp}</td>
                        <td className="px-6 py-3 text-sm text-main-text">{areaLabel(record.area)}</td>
                        <td className="px-6 py-3 text-right text-sm font-medium text-main-text">
                          {record.consumptionMWh.toFixed(2)} MWh
                        </td>
                        <td className="px-6 py-3 text-right text-sm text-secondary-text">
                          {record.baselineMWh.toFixed(2)} MWh
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              above ? 'bg-warning/10 text-warning' : 'bg-soft-mint text-primary-green'
                            }`}
                          >
                            {above ? 'Di Atas Baseline' : 'Dalam Rentang'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-secondary-text">{ENERGY_SOURCE_LABEL[record.source]}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}

function Th({
  label,
  align = 'left',
  onClick,
}: {
  label: string
  align?: 'left' | 'right' | 'center'
  onClick?: () => void
}) {
  return (
    <th
      className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-secondary-text ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      }`}
    >
      {onClick ? (
        <button
          onClick={onClick}
          className={`inline-flex items-center gap-1 transition-colors hover:text-main-text ${
            align === 'right' ? 'flex-row-reverse' : ''
          }`}
        >
          {label}
          <ArrowUpDown size={12} />
        </button>
      ) : (
        label
      )}
    </th>
  )
}

export default EnergyPage
