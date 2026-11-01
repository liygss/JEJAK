import { Link } from 'react-router-dom'
import { Menu, Download, User, ChevronDown, RefreshCw, ArrowLeftRight, Shield } from 'lucide-react'
import { useFilters, type PeriodOption, type PlantOption } from '../../lib/FiltersContext'
import { useToast } from '../ui/Toast'
import { energyRecords } from '../../data/energy'
import { carbonRecords } from '../../data/carbon'
import {
  calculateTotalCarbon,
  calculateTotalCost,
  calculateTotalEnergy,
} from '../../lib/calculations'
import { PERIOD_LABEL, PLANT_LABEL, PERIOD_OPTIONS, PLANT_OPTIONS } from '../../lib/id'

interface AppHeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
  role?: 'user' | 'admin'
}

const plants: PlantOption[] = PLANT_OPTIONS
const periods: PeriodOption[] = PERIOD_OPTIONS

const AppHeader = ({ title, subtitle, onMenuClick, role = 'user' }: AppHeaderProps) => {
  const { plant, setPlant, period, setPeriod, filterEnergy, filterCarbon, loading, refresh, lastUpdated } = useFilters()
  const { toast } = useToast()

  const handleExport = () => {
    const energy = filterEnergy(energyRecords)
    const carbon = filterCarbon(carbonRecords)
    const rows = [
      ['Ekspor Ringkasan JEJAK'],
      ['Pabrik', PLANT_LABEL[plant]],
      ['Periode', PERIOD_LABEL[period]],
      ['Dibuat', new Date().toISOString()],
      [],
      ['Metrik', 'Nilai'],
      ['Total Energi (MWh)', calculateTotalEnergy(energy).toFixed(2)],
      ['Total Karbon (tCO2e)', calculateTotalCarbon(carbon).toFixed(2)],
      ['Total Biaya Energi (IDR)', calculateTotalCost(energy).toFixed(0)],
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `jejak_summary_${period.toLowerCase().replace(/\s+/g, '_')}.csv`
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({ title: 'Ringkasan diekspor', description: 'Unduhan CSV dimulai.', variant: 'success' })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="inline-flex items-center justify-center rounded-12 p-2 text-secondary-text transition-colors hover:bg-slate-50 hover:text-main-text lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-main-text md:text-xl">{title}</h1>
            {subtitle && <p className="mt-0.5 truncate text-sm text-secondary-text">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {role === 'user' && (
            <>
              <div className="hidden items-center gap-2 md:flex">
                <Select value={plant} options={plants} render={(v) => PLANT_LABEL[v]} onChange={setPlant} />
                <Select value={period} options={periods} render={(v) => PERIOD_LABEL[v]} onChange={setPeriod} />
              </div>
              <button
                onClick={refresh}
                disabled={loading}
                title="Muat ulang data"
                className="hidden items-center gap-1.5 rounded-12 border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-secondary-text transition-colors hover:bg-main-bg hover:text-main-text disabled:opacity-60 sm:inline-flex"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span className="hidden xl:inline">{loading ? 'Memperbarui…' : `Diperbarui ${lastUpdated}`}</span>
              </button>
              <button
                onClick={handleExport}
                className="hidden items-center gap-2 rounded-12 bg-primary-green px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-deep-teal md:inline-flex"
              >
                <Download size={16} />
                Ekspor Laporan
              </button>
            </>
          )}

          <Link
            to={role === 'admin' ? '/dashboard' : '/admin'}
            className="hidden items-center gap-1.5 rounded-12 border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-secondary-text transition-colors hover:bg-main-bg hover:text-main-text sm:inline-flex"
          >
            <ArrowLeftRight size={14} />
            {role === 'admin' ? 'Pengguna' : 'Admin'}
          </Link>

          <div
            className={`inline-flex items-center gap-2 rounded-12 border px-2.5 py-1.5 ${
              role === 'admin' ? 'border-deep-teal/20 bg-teal-50' : 'border-border bg-main-bg'
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                role === 'admin' ? 'bg-white text-deep-teal' : 'bg-soft-mint text-primary-green'
              }`}
            >
              {role === 'admin' ? <Shield size={15} /> : <User size={16} />}
            </div>
            <span className="hidden text-xs font-medium text-main-text md:inline">
              {role === 'admin' ? 'Admin' : 'Pengguna'}
            </span>
          </div>
        </div>
      </div>
      {role === 'user' && (
        <div className="flex items-center gap-2 px-4 pb-3 md:hidden">
          <Select value={plant} options={plants} render={(v) => PLANT_LABEL[v]} onChange={setPlant} />
          <Select value={period} options={periods} render={(v) => PERIOD_LABEL[v]} onChange={setPeriod} />
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-12 border border-border bg-surface p-2 text-secondary-text disabled:opacity-60"
            aria-label="Muat ulang"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      )}
    </header>
  )
}

function Select<T extends string>({
  value,
  options,
  onChange,
  render,
}: {
  value: T
  options: T[]
  onChange: (v: T) => void
  render?: (v: T) => string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none rounded-12 border border-border bg-surface py-1.5 pl-3 pr-8 text-xs font-medium text-main-text focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {render ? render(o) : o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text"
      />
    </div>
  )
}

export default AppHeader
