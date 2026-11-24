import { useMemo, useState, type FormEvent } from 'react'
import { Fuel, Leaf, ClipboardList, Droplets, Flame, Factory, Plus, Trash2, Download, Search, Inbox } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import AppHeader from '../components/layout/AppHeader'
import { useSidebar } from '../components/layout/DashboardLayout'
import KpiCard from '../components/dashboard/KpiCard'
import { Stagger, StaggerItem } from '../components/ui/Reveal'
import { Skeleton, SkeletonCard, SkeletonChart } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import type { FuelCategory, FuelRecord, FuelType, PlantOption } from '../data/types'
import { DEMO_MIN_DATE, LATEST_FUEL_DATE } from '../data/fuel'
import { FUEL_CATEGORIES, FUEL_FACTORS, FUEL_FACTOR_NOTE, FUEL_TYPES } from '../data/fuelFactors'
import { useFilters } from '../lib/FiltersContext'
import { useFuelLog } from '../lib/FuelLogContext'
import {
  calculateEmissionsTCO2e,
  calculateFuelEmissions,
  calculateFuelEnergyGJ,
  getDailyFuelSeries,
  getFuelBreakdown,
} from '../lib/fuelEmissions'
import { formatNumber, formatTCO2e } from '../lib/formatters'
import {
  CARBON_STATUS_LABEL,
  ENERGY_SOURCE_LABEL,
  FUEL_CATEGORY_LABEL,
  FUEL_TYPE_LABEL,
  PLANT_LABEL,
  PLANT_OPTIONS,
} from '../lib/id'
import { FUEL_COLOR, FUEL_PALETTE } from '../lib/chartColors'

const inputClass =
  'w-full rounded-12 border border-border bg-surface px-3 py-2 text-sm text-main-text focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20'
const labelClass = 'mb-1.5 block text-xs font-medium text-secondary-text'

const FuelPage = () => {
  const { openSidebar } = useSidebar()
  const { filterFuel, plant, period, loading } = useFilters()
  const { records, manualRecords, addRecord, removeRecord } = useFuelLog()
  const { toast } = useToast()

  const [formDate, setFormDate] = useState(LATEST_FUEL_DATE)
  const [plantOverride, setPlantOverride] = useState<PlantOption | null>(null)
  const [formFuelType, setFormFuelType] = useState<FuelType>('Diesel')
  const [formQuantity, setFormQuantity] = useState('120')
  const [equipmentOverride, setEquipmentOverride] = useState<string | null>(null)
  const [formSource, setFormSource] = useState<FuelRecord['source']>('Manual Entry')
  const [formStatus, setFormStatus] = useState<FuelRecord['dataStatus']>('Recorded')
  const [formNote, setFormNote] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'All' | FuelCategory>('All')

  const factor = FUEL_FACTORS[formFuelType]
  const formPlant = plantOverride ?? plant
  const formEquipment = equipmentOverride ?? factor.equipment

  const periodData = useMemo(() => filterFuel(records), [filterFuel, records])
  const totalEmissions = calculateFuelEmissions(periodData)
  const totalGJ = calculateFuelEnergyGJ(periodData)
  const breakdown = useMemo(() => getFuelBreakdown(periodData), [periodData])
  const dailySeries = useMemo(() => getDailyFuelSeries(periodData), [periodData])

  const rows = useMemo(
    () =>
      periodData
        .filter((record) => categoryFilter === 'All' || record.category === categoryFilter)
        .filter((record) => {
          const haystack = `${record.timestamp} ${FUEL_FACTORS[record.fuelType].label} ${record.equipment} ${record.note ?? ''}`
          return haystack.toLowerCase().includes(search.toLowerCase())
        })
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp) || a.fuelType.localeCompare(b.fuelType)),
    [periodData, categoryFilter, search]
  )

  const previewEmissions = calculateEmissionsTCO2e(Number(formQuantity) || 0, formFuelType)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const quantity = Number(formQuantity)
    if (!formDate || !Number.isFinite(quantity) || quantity <= 0) {
      toast({ title: 'Data belum lengkap', description: 'Isi tanggal dan kuantitas yang valid.', variant: 'warning' })
      return
    }
    addRecord({
      timestamp: formDate,
      plant: formPlant,
      fuelType: formFuelType,
      quantity,
      equipment: formEquipment,
      source: formSource,
      dataStatus: formStatus,
      note: formNote,
    })
    setFormQuantity('')
    setFormNote('')
    toast({ title: 'Catatan bahan bakar ditambahkan', description: `${formatTCO2e(previewEmissions)} dicatat sebagai Scope 1.`, variant: 'success' })
  }

  const handleDownload = () => {
    const csvRows = [
      ['JEJAK Fuel Log'],
      ['Pabrik', PLANT_LABEL[plant]],
      ['Periode', period],
      ['Dibuat', new Date().toISOString()],
      ['Catatan', FUEL_FACTOR_NOTE],
      [],
      ['Waktu', 'Pabrik', 'Jenis', 'Kategori', 'Kuantitas', 'Satuan', 'Peralatan', 'NCV (GJ/unit)', 'EF (tCO2e/TJ)', 'Emisi (tCO2e)', 'Sumber', 'Status Data'],
      ...rows.map((record) => [
        record.timestamp,
        PLANT_LABEL[record.plant],
        FUEL_TYPE_LABEL[record.fuelType],
        FUEL_CATEGORY_LABEL[record.category],
        record.quantity,
        record.unit,
        record.equipment,
        record.ncvGJPerUnit,
        record.efTCO2PerTJ,
        record.emissionsTCO2e,
        ENERGY_SOURCE_LABEL[record.source],
        CARBON_STATUS_LABEL[record.dataStatus],
      ]),
    ]
    const csv = csvRows.map((row) => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `jejak_fuel_log_${new Date().toISOString().split('T')[0]}.csv`
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({ title: 'CSV diunduh', description: 'Ekspor catatan bahan bakar dimulai.', variant: 'success' })
  }

  return (
    <>
      <AppHeader
        title="Pencatatan Bahan Bakar"
        subtitle="Catat konsumsi bahan bakar dan emisi Scope 1 dari sumber langsung"
        onMenuClick={openSidebar}
      />
      <main className="space-y-6 p-4 md:p-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
            <StaggerItem>
              <KpiCard
                title="Emisi Scope 1"
                value={formatTCO2e(totalEmissions, 2)}
                numericValue={totalEmissions}
                format={(value) => formatTCO2e(value, 2)}
                icon={Leaf}
                tooltip="Total emisi langsung dari pembakaran bahan bakar pada periode yang dipilih."
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Energi Bahan Bakar"
                value={`${formatNumber(totalGJ, 1)} GJ`}
                numericValue={totalGJ}
                format={(value) => `${formatNumber(value, 1)} GJ`}
                icon={Flame}
                tooltip="Total nilai kalor (NCV) dari kuantitas bahan bakar yang tercatat."
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Jumlah Catatan"
                value={`${periodData.length}`}
                numericValue={periodData.length}
                format={(value) => `${value}`}
                icon={ClipboardList}
                tooltip="Jumlah catatan bahan bakar pada pabrik dan periode yang dipilih."
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Catatan Manual"
                value={`${periodData.filter((record) => record.source === 'Manual Entry').length}`}
                numericValue={periodData.filter((record) => record.source === 'Manual Entry').length}
                format={(value) => `${value}`}
                icon={Fuel}
                tooltip="Catatan yang diinput manual dari penerimaan, pengeluaran, atau tagihan."
              />
            </StaggerItem>
          </Stagger>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6 xl:col-span-2">
            <h3 className="mb-6 text-lg font-semibold text-main-text">Tren Emisi Bahan Bakar</h3>
            {loading ? (
              <SkeletonChart />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySeries} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" stroke="var(--color-secondary-text)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--color-secondary-text)" tick={{ fontSize: 12 }} />
                    <RTooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="value" stroke={FUEL_COLOR} strokeWidth={2} name="tCO₂e" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
            <h3 className="mb-6 text-lg font-semibold text-main-text">Emisi per Jenis</h3>
            {loading ? (
              <SkeletonChart />
            ) : breakdown.length === 0 ? (
              <p className="text-sm text-secondary-text">Tidak ada data untuk periode ini.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdown} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="label" stroke="var(--color-secondary-text)" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis stroke="var(--color-secondary-text)" tick={{ fontSize: 12 }} />
                    <RTooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="emissionsTCO2e" radius={[8, 8, 0, 0]} name="tCO₂e">
                      {breakdown.map((item, index) => (
                        <Cell key={item.fuelType} fill={FUEL_PALETTE[index % FUEL_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-main-text">Tambah Catatan Bahan Bakar</h3>
              <p className="mt-1 text-xs text-secondary-text">Emisi dihitung otomatis: kuantitas × NCV × faktor emisi.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-warning">
              <Factory size={14} /> Scope 1
            </span>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className={labelClass} htmlFor="fuel-date">Tanggal</label>
              <input
                id="fuel-date"
                type="date"
                min={DEMO_MIN_DATE}
                max={LATEST_FUEL_DATE}
                value={formDate}
                onChange={(event) => setFormDate(event.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="fuel-plant">Pabrik</label>
              <select id="fuel-plant" value={formPlant} onChange={(event) => setPlantOverride(event.target.value as PlantOption)} className={inputClass}>
                {PLANT_OPTIONS.map((option) => (
                  <option key={option} value={option}>{PLANT_LABEL[option]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="fuel-type">Jenis Bahan Bakar</label>
              <select id="fuel-type" value={formFuelType} onChange={(event) => {
                setFormFuelType(event.target.value as FuelType)
                setEquipmentOverride(null)
              }} className={inputClass}>
                {FUEL_CATEGORIES.map((category) => (
                  <optgroup key={category} label={FUEL_CATEGORY_LABEL[category]}>
                    {FUEL_TYPES.filter((type) => FUEL_FACTORS[type].category === category).map((type) => (
                      <option key={type} value={type}>{FUEL_FACTORS[type].label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="fuel-quantity">Kuantitas ({factor.unit})</label>
              <input
                id="fuel-quantity"
                type="number"
                min="0"
                step="any"
                value={formQuantity}
                onChange={(event) => setFormQuantity(event.target.value)}
                className={inputClass}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="fuel-equipment">Peralatan</label>
              <input
                id="fuel-equipment"
                type="text"
                value={formEquipment}
                onChange={(event) => setEquipmentOverride(event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="fuel-source">Metode Pencatatan</label>
              <select
                id="fuel-source"
                value={formSource}
                onChange={(event) => setFormSource(event.target.value as FuelRecord['source'])}
                className={inputClass}
              >
                <option value="Manual Entry">Manual (Fuel Log)</option>
                <option value="IoT Simulation">Otomatis (Sensor IoT)</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="fuel-status">Status Data</label>
              <select
                id="fuel-status"
                value={formStatus}
                onChange={(event) => setFormStatus(event.target.value as FuelRecord['dataStatus'])}
                className={inputClass}
              >
                <option value="Recorded">Tercatat</option>
                <option value="Estimated">Estimasi</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="fuel-note">Catatan Bukti</label>
              <input
                id="fuel-note"
                type="text"
                value={formNote}
                onChange={(event) => setFormNote(event.target.value)}
                className={inputClass}
                placeholder="Nomor nota / meteran"
              />
            </div>
            <div className="rounded-12 border border-border bg-main-bg/60 p-3 md:col-span-2 xl:col-span-3">
              <p className="text-xs text-secondary-text">Pratinjau perhitungan</p>
              <p className="mt-1 text-sm text-main-text">
                {formatNumber(Number(formQuantity) || 0, 2)} {factor.unit} × {factor.ncvGJPerUnit} GJ/{factor.unit} × {factor.efTCO2PerTJ} tCO₂e/TJ
              </p>
              <p className="mt-1 text-base font-semibold text-primary-green">{formatTCO2e(previewEmissions, 3)}</p>
              <p className="mt-2 text-[11px] text-secondary-text">{FUEL_FACTOR_NOTE}</p>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-12 bg-primary-green px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-deep-teal"
              >
                <Plus size={16} /> Simpan Catatan
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-18 border border-border bg-surface p-4 shadow-sm">
            <Droplets size={20} className="text-primary-green" />
            <h4 className="mt-3 text-sm font-semibold text-main-text">Bahan Bakar Cair</h4>
            <p className="mt-1 text-xs text-secondary-text">Solar, diesel, dan MFO dicatat dari flow meter saluran pipa atau catatan penerimaan.</p>
          </div>
          <div className="rounded-18 border border-border bg-surface p-4 shadow-sm">
            <Flame size={20} className="text-primary-green" />
            <h4 className="mt-3 text-sm font-semibold text-main-text">Bahan Bakar Gas</h4>
            <p className="mt-1 text-xs text-secondary-text">Gas alam, LPG, dan CNG dicatat dari thermal mass/vortex meter atau tagihan penyedia.</p>
          </div>
          <div className="rounded-18 border border-border bg-surface p-4 shadow-sm">
            <Factory size={20} className="text-primary-green" />
            <h4 className="mt-3 text-sm font-semibold text-main-text">Bahan Bakar Padat</h4>
            <p className="mt-1 text-xs text-secondary-text">Batubara dan biomassa ditimbang dengan jembatan timbang atau conveyor scale.</p>
          </div>
        </div>

        <div className="rounded-18 border border-border bg-surface shadow-sm">
          <div className="border-b border-border p-4 md:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-semibold text-main-text">Riwayat Catatan Bahan Bakar</h3>
                <p className="mt-1 text-xs text-secondary-text">Data sensor (IoT) dan input manual disatukan dalam satu siklus pelaporan.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type="text"
                    placeholder="Cari jenis atau tanggal..."
                    className="w-full rounded-12 border border-border py-2 pl-9 pr-3 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20 sm:w-56"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <select
                  className="rounded-12 border border-border px-3 py-2 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value as 'All' | FuelCategory)}
                >
                  <option value="All">Semua Kategori</option>
                  {FUEL_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{FUEL_CATEGORY_LABEL[category]}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-12 bg-primary-green px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-deep-teal"
                >
                  <Download size={16} /> Ekspor CSV
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px]">
              <thead>
                <tr className="border-b border-border bg-main-bg">
                  {['Waktu', 'Jenis', 'Kategori', 'Kuantitas', 'NCV', 'EF', 'Emisi', 'Sumber', 'Status', ''].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-text">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 10 }).map((__, cell) => (
                        <td key={cell} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-16">
                      <div className="flex flex-col items-center text-center">
                        <Inbox size={28} className="text-secondary-text/50" />
                        <p className="mt-3 text-sm text-secondary-text">Tidak ada catatan yang cocok dengan filter Anda.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-main-bg/50">
                      <td className="px-4 py-3 text-sm text-main-text">{record.timestamp}</td>
                      <td className="px-4 py-3 text-sm text-main-text">{FUEL_FACTORS[record.fuelType].label}</td>
                      <td className="px-4 py-3 text-sm text-secondary-text">{FUEL_CATEGORY_LABEL[record.category]}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-main-text">
                        {formatNumber(record.quantity, record.quantity >= 100 ? 0 : 2)} {record.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-secondary-text">{record.ncvGJPerUnit}</td>
                      <td className="px-4 py-3 text-right text-sm text-secondary-text">{record.efTCO2PerTJ}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-main-text">{formatTCO2e(record.emissionsTCO2e, 3)}</td>
                      <td className="px-4 py-3 text-sm text-secondary-text">{ENERGY_SOURCE_LABEL[record.source]}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            record.dataStatus === 'Recorded' ? 'bg-soft-mint text-primary-green' : 'bg-amber-50 text-warning'
                          }`}
                        >
                          {CARBON_STATUS_LABEL[record.dataStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {manualRecords.some((item) => item.id === record.id) && (
                          <button
                            type="button"
                            onClick={() => {
                              removeRecord(record.id)
                              toast({ title: 'Catatan dihapus', variant: 'info' })
                            }}
                            className="rounded-8 p-1.5 text-secondary-text transition-colors hover:bg-warning/10 hover:text-warning"
                            aria-label="Hapus catatan"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
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

export default FuelPage
