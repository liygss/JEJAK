import { useMemo, useState } from 'react'
import { Leaf, Factory, BarChart3, Download, Search, Inbox } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import AppHeader from '../components/layout/AppHeader'
import { useSidebar } from '../components/layout/DashboardLayout'
import KpiCard from '../components/dashboard/KpiCard'
import { Stagger, StaggerItem } from '../components/ui/Reveal'
import { Skeleton, SkeletonCard, SkeletonChart } from '../components/ui/Skeleton'
import { carbonRecords as carbonData } from '../data/carbon'
import { useFilters } from '../lib/FiltersContext'
import { useToast } from '../components/ui/Toast'
import { formatTCO2e } from '../lib/formatters'
import { calculateTotalCarbon } from '../lib/calculations'
import { CARBON_STATUS_LABEL, SCOPE_LABEL, areaLabel } from '../lib/id'

const SOURCE_COLORS = ['#059669', '#14B8A6', '#0F766E', '#5EEAD4']

const CarbonPage = () => {
  const { openSidebar } = useSidebar()
  const { filterCarbon, plant, period, loading } = useFilters()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  const periodData = useMemo(() => filterCarbon(carbonData), [filterCarbon])

  const totalEmissions = calculateTotalCarbon(periodData)
  const scope1 = periodData.filter((r) => r.scope === 'Scope 1').reduce((s, r) => s + r.emissionsTCO2e, 0)
  const scope2 = periodData.filter((r) => r.scope === 'Scope 2').reduce((s, r) => s + r.emissionsTCO2e, 0)
  const days = new Set(periodData.map((r) => r.timestamp)).size || 1
  const intensity = totalEmissions / days

  const trendData = useMemo(() => {
    const byDay = periodData.reduce((acc, r) => {
      acc[r.timestamp] = (acc[r.timestamp] ?? 0) + r.emissionsTCO2e
      return acc
    }, {} as Record<string, number>)
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date: new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
        emissions: Number(value.toFixed(2)),
      }))
  }, [periodData])

  const sourceData = useMemo(() => {
    const bySource = periodData.reduce((acc, r) => {
      acc[r.source] = (acc[r.source] ?? 0) + r.emissionsTCO2e
      return acc
    }, {} as Record<string, number>)
    return Object.entries(bySource).map(([source, value]) => ({
      source: areaLabel(source),
      emissions: Number(value.toFixed(2)),
    }))
  }, [periodData])

  const filteredRecords = periodData.filter(
    (r) =>
      r.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.timestamp.includes(searchTerm)
  )

  const downloadCSV = (rows: (string | number)[][], filename: string) => {
    const csvContent = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = filename
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleGenerateReport = () => {
    downloadCSV(
      [
        ['JEJAK Carbon Report'],
        ['Plant', plant],
        ['Period', period],
        ['Generated', new Date().toISOString()],
        [],
        ['Timestamp', 'Source', 'Scope', 'Emissions (tCO2e)', 'Data Status'],
        ...filteredRecords.map((r) => [r.timestamp, r.source, r.scope, r.emissionsTCO2e, r.dataStatus]),
      ],
      `jejak_carbon_report_${new Date().toISOString().split('T')[0]}.csv`
    )
    toast({
      title: 'Laporan dibuat',
      description: 'Unduhan CSV dimulai.',
      variant: 'success',
    })
  }

  return (
    <>
      <AppHeader
        title="Pengukuran & Pelaporan Karbon"
        subtitle="Pantau emisi dan dukung MRV karbon terstruktur"
        onMenuClick={openSidebar}
      />
      <main className="space-y-6 p-4 md:p-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
            <StaggerItem>
              <KpiCard
                title="Total Emisi"
                value={formatTCO2e(totalEmissions)}
                numericValue={totalEmissions}
                format={(n) => formatTCO2e(n)}
                icon={Leaf}
                tooltip="Total estimasi emisi untuk periode yang dipilih."
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Scope 1"
                value={formatTCO2e(scope1)}
                numericValue={scope1}
                format={(n) => formatTCO2e(n)}
                icon={Factory}
                tooltip="Emisi langsung dari sumber yang dimiliki atau dikendalikan."
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Scope 2"
                value={formatTCO2e(scope2)}
                numericValue={scope2}
                format={(n) => formatTCO2e(n)}
                icon={BarChart3}
                tooltip="Emisi tidak langsung dari energi yang dibeli."
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Intensitas Emisi"
                value={`${intensity.toFixed(2)} tCO₂e/hari`}
                numericValue={intensity}
                format={(n) => `${n.toFixed(2)} tCO₂e/hari`}
                icon={BarChart3}
                tooltip="Rata-rata emisi harian untuk periode yang dipilih."
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
            <h3 className="mb-6 text-lg font-semibold text-main-text">Tren Emisi</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-secondary-text)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--color-secondary-text)" tick={{ fontSize: 12 }} />
                  <RTooltip
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="emissions" stroke="var(--color-primary-green)" strokeWidth={2} name="tCO₂e" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
            <h3 className="mb-6 text-lg font-semibold text-main-text">Emisi per Sumber</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="source" stroke="var(--color-secondary-text)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--color-secondary-text)" tick={{ fontSize: 12 }} />
                  <RTooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="emissions" radius={[8, 8, 0, 0]}>
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        )}

        <div className="rounded-18 border border-border bg-surface shadow-sm">
          <div className="border-b border-border p-4 md:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-semibold text-main-text">Tabel Data Karbon</h3>
                <p className="mt-1 text-xs text-secondary-text">
                  *Faktor emisi yang digunakan adalah nilai konfigurasi yang dapat disesuaikan, bukan faktor regulasi resmi.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type="text"
                    placeholder="Cari..."
                    className="w-full rounded-12 border border-border py-2 pl-9 pr-3 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20 sm:w-44"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleGenerateReport}
                  className="inline-flex items-center justify-center gap-2 rounded-12 bg-primary-green px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-deep-teal"
                >
                  <Download size={16} />
                  Buat Laporan
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-main-bg">
                  {[
                    { key: 'Waktu', right: false },
                    { key: 'Sumber', right: false },
                    { key: 'Scope', right: false },
                    { key: 'Emisi', right: true },
                    { key: 'Status Data', right: false, center: true },
                  ].map((h) => (
                    <th
                      key={h.key}
                      className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-secondary-text ${
                        h.right ? 'text-right' : h.center ? 'text-center' : 'text-left'
                      }`}
                    >
                      {h.key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-6 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16">
                      <div className="flex flex-col items-center text-center">
                        <Inbox size={28} className="text-secondary-text/50" />
                        <p className="mt-3 text-sm text-secondary-text">Tidak ada catatan yang cocok dengan filter Anda.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => (
                    <tr key={index} className="transition-colors hover:bg-main-bg/50">
                      <td className="px-6 py-3 text-sm text-main-text">{record.timestamp}</td>
                      <td className="px-6 py-3 text-sm text-main-text">{areaLabel(record.source)}</td>
                      <td className="px-6 py-3 text-sm text-main-text">{SCOPE_LABEL[record.scope as keyof typeof SCOPE_LABEL]}</td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-main-text">
                        {record.emissionsTCO2e.toFixed(2)} tCO₂e
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            record.dataStatus === 'Recorded' ? 'bg-soft-mint text-primary-green' : 'bg-amber-50 text-warning'
                          }`}
                        >
                          {CARBON_STATUS_LABEL[record.dataStatus as keyof typeof CARBON_STATUS_LABEL]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}

export default CarbonPage
