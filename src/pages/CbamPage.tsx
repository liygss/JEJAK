import { useMemo, useState } from 'react'
import {
  ShieldCheck,
  Globe,
  Calculator,
  CheckCircle2,
  Circle,
  Info,
  ArrowRight,
  Leaf,
  Factory,
  FileText,
  Loader2,
  RotateCcw,
  Gauge,
  TrendingUp,
  Lightbulb,
  PieChart as PieIcon,
  Coins,
  CalendarClock,
  FileSpreadsheet,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import { useSidebar } from '../components/layout/DashboardLayout'
import KpiCard from '../components/dashboard/KpiCard'
import CalculationResult from '../components/ui/CalculationResult'
import { Stagger, StaggerItem, Reveal } from '../components/ui/Reveal'
import { useToast } from '../components/ui/Toast'
import { useFilters } from '../lib/FiltersContext'
import { carbonRecords } from '../data/carbon'
import { energyRecords } from '../data/energy'
import { calculateTotalCarbon } from '../lib/calculations'
import { formatCurrencyIDR, formatCurrencyIDRCompact, formatTCO2e, formatNumber } from '../lib/formatters'
import { downloadPdf } from '../lib/pdf'
import { buildCbamExportData } from '../lib/cbamData'
import { generateCbamExcel } from '../lib/cbamExcel'
import {
  cbamCommodities,
  getCommodity,
  estimateCbamCostEur,
  readinessChecklist,
  EUR_TO_IDR,
  CBAM_DISCLAIMER,
} from '../data/cbam'
import { READINESS_LABEL, T } from '../lib/id'

const CHART_COLORS = ['#059669', '#14B8A6', '#0F766E']
const MUTED_BAR = '#CBD5E1'

const CbamPage = () => {
  const { openSidebar } = useSidebar()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { plant, period, filterCarbon, filterEnergy } = useFilters()

  const [commodityId, setCommodityId] = useState(cbamCommodities[0].id)
  const [tonnes, setTonnes] = useState(cbamCommodities[0].defaultTonnes)
  const [intensity, setIntensity] = useState(cbamCommodities[0].defaultEmbeddedIntensity)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [exporting, setExporting] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)

  const commodity = getCommodity(commodityId)
  const costEur = estimateCbamCostEur(commodity.ratePerTonneEur, tonnes)
  const costIDR = costEur * EUR_TO_IDR
  const perTonneIDR = commodity.ratePerTonneEur * EUR_TO_IDR
  const embeddedEmissions = intensity * tonnes
  const perTonneCo2IDR = embeddedEmissions > 0 ? costIDR / embeddedEmissions : 0
  const sliderMax = Math.max(5000, Math.ceil(tonnes / 500) * 500)

  const comparisonData = useMemo(
    () =>
      cbamCommodities.map((c) => ({
        name: c.name,
        costIDR: estimateCbamCostEur(c.ratePerTonneEur, tonnes) * EUR_TO_IDR,
        selected: c.id === commodityId,
      })),
    [tonnes, commodityId]
  )

  const totalComparisonIDR = comparisonData.reduce((s, d) => s + d.costIDR, 0)
  const selectedShare = totalComparisonIDR > 0 ? (costIDR / totalComparisonIDR) * 100 : 0

  const donutData = useMemo(
    () => comparisonData.map((d) => ({ name: d.name, value: d.costIDR, selected: d.selected })),
    [comparisonData]
  )

  const monitoredEmissions = useMemo(
    () => calculateTotalCarbon(filterCarbon(carbonRecords)),
    [filterCarbon]
  )

  const completed = readinessChecklist.filter((i) => checked[i.id]).length
  const completion = Math.round((completed / readinessChecklist.length) * 100)
  const nextItem = readinessChecklist.find((i) => !checked[i.id])
  const readinessLabel =
    completion === 100 ? 'Ready' : completion >= 50 ? 'In progress' : 'Not ready'
  const readinessTone =
    completion === 100 ? 'text-primary-green' : completion >= 50 ? 'text-warning' : 'text-danger'

  const mostExpensive = useMemo(
    () => cbamCommodities.reduce((a, b) => (b.ratePerTonneEur > a.ratePerTonneEur ? b : a)),
    []
  )

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleCommodity = (id: string) => {
    const c = getCommodity(id)
    setCommodityId(c.id)
    setTonnes(c.defaultTonnes)
    setIntensity(c.defaultEmbeddedIntensity)
  }

  const buildExportData = () =>
    buildCbamExportData(
      plant,
      period,
      commodity,
      tonnes,
      intensity,
      filterEnergy(energyRecords),
      filterCarbon(carbonRecords),
      checked,
      readinessChecklist
    )

  const exportExcel = async () => {
    if (exportingExcel) return
    setExportingExcel(true)
    try {
      const data = buildExportData()
      await generateCbamExcel(data)
      toast({ title: 'Excel Siap', description: 'Template resmi CBAM terisi berhasil diunduh.', variant: 'success' })
    } catch (err) {
      console.error(err)
      toast({ title: 'Gagal Ekspor Excel', description: 'Terjadi kesalahan saat mengisi template.', variant: 'warning' })
    } finally {
      setExportingExcel(false)
    }
  }

  const exportPdf = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const { default: CbamPdfDocument } = await import('../components/reports/CbamPdfDocument')
      const data = buildExportData()
      await downloadPdf(<CbamPdfDocument data={data} />, `jejak_cbam_report_${commodity.id}.pdf`)
      toast({ title: 'PDF siap', description: 'Unduhan laporan komprehensif CBAM dimulai.', variant: 'success' })
    } catch (err) {
      console.error(err)
      toast({ title: 'PDF gagal', description: 'Tidak dapat membuat PDF.', variant: 'warning' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <AppHeader
        title="Kepatuhan CBAM"
        subtitle="Estimasi eksposur dan pantau kesiapan"
        onMenuClick={openSidebar}
      />
      <main className="space-y-6 p-4 md:p-6">
        {/* Context banner */}
        <Reveal>
          <div className="relative overflow-hidden rounded-18 border border-border bg-gradient-to-br from-soft-mint/70 via-surface to-surface p-5 shadow-sm md:p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-accent/10 blur-2xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-12 bg-white text-primary-green shadow-sm">
                <Globe size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-main-text">
                    Mekanisme Penyesuaian Perbatasan Karbon (CBAM)
                  </h2>
                  <span className="rounded-full bg-soft-mint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-green">
                    Estimasi
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-secondary-text">
                  Pada fase definitifnya (mulai 1 Januari 2026), hanya
                  <span className="font-medium text-main-text"> Deklaran CBAM yang Berwenang </span>
                  yang boleh mengimpor barang yang tercakup ke UE. Estimasi eksposur dan pantau data
                  yang Anda perlukan untuk pelaporan.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* KPI strip */}
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
          <StaggerItem>
            <KpiCard
              title="Estimasi Biaya CBAM"
              value={formatCurrencyIDRCompact(costIDR)}
              numericValue={costIDR}
              format={(n) => formatCurrencyIDRCompact(n)}
              icon={Calculator}
              accent
              tooltip="Estimasi untuk komoditas dan volume yang dipilih."
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              title="Biaya per tCO₂e"
              value={formatCurrencyIDRCompact(perTonneCo2IDR)}
              numericValue={perTonneCo2IDR}
              format={(n) => formatCurrencyIDRCompact(n)}
              icon={Gauge}
              tooltip="Biaya estimasi dibagi dengan emisi tersemat tersirat."
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              title="Emisi Terpantau"
              value={formatTCO2e(monitoredEmissions)}
              numericValue={monitoredEmissions}
              format={(n) => formatTCO2e(n)}
              icon={Leaf}
              tooltip="Total emisi dari catatan pemantauan Anda pada periode ini (umpan untuk pelaporan CBAM)."
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              title="Kesiapan"
              value={`${completion}%`}
              numericValue={completion}
              format={(n) => `${n}%`}
              icon={ShieldCheck}
              accent={completion === 100}
              subtitle={READINESS_LABEL[readinessLabel]}
              tooltip="Proporsi item daftar periksa kesiapan yang Anda tandai selesai."
            />
          </StaggerItem>
        </Stagger>

        {/* Narrative insight strip */}
        <Reveal>
          <div className="flex items-start gap-3 rounded-18 border border-border bg-surface p-4 shadow-sm md:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
              <Lightbulb size={18} />
            </div>
            <p className="text-sm leading-relaxed text-secondary-text">
              Pada <span className="font-semibold text-main-text">{tonnes.toLocaleString('id-ID')} ton</span>,{' '}
              <span className="font-semibold text-main-text">{commodity.name}</span> menyumbang{' '}
              <span className="font-semibold text-primary-green">{selectedShare.toFixed(0)}%</span> dari eksposur
              yang dimodelkan pada komoditas yang tercakup.{' '}
              <span className="font-semibold text-main-text">{mostExpensive.name}</span>{' '}
              adalah yang termahal per ton (€{mostExpensive.ratePerTonneEur}/t).
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          {/* Simulator */}
          <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6 xl:col-span-3">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
                <Calculator size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-main-text">Simulator Biaya</h3>
                <p className="text-xs text-secondary-text">Estimasi biaya • keluaran dalam IDR</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="cbam-commodity" className="mb-1.5 block text-xs font-medium text-secondary-text">
                  Komoditas
                </label>
                <select
                  id="cbam-commodity"
                  value={commodityId}
                  onChange={(e) => handleCommodity(e.target.value)}
                  className="w-full rounded-12 border border-border px-3 py-2 text-sm text-main-text focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
                >
                  {cbamCommodities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — €{c.ratePerTonneEur}/t
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cbam-tonnes" className="mb-1.5 block text-xs font-medium text-secondary-text">
                  Volume tahunan (ton)
                </label>
                <input
                  id="cbam-tonnes"
                  type="number"
                  min={0}
                  value={tonnes}
                  onChange={(e) => setTonnes(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-12 border border-border px-3 py-2 text-sm text-main-text focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
                />
              </div>
              <div>
                <label htmlFor="cbam-intensity" className="mb-1.5 block text-xs font-medium text-secondary-text">
                  Intensitas tersemat (tCO₂e/t)
                </label>
                <input
                  id="cbam-intensity"
                  type="number"
                  min={0}
                  step={0.1}
                  value={intensity}
                  onChange={(e) => setIntensity(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-12 border border-border px-3 py-2 text-sm text-main-text focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
                />
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={sliderMax}
              step={50}
              value={Math.min(tonnes, sliderMax)}
              onChange={(e) => setTonnes(Number(e.target.value))}
              className="mt-5 w-full accent-[var(--color-primary-green)]"
              aria-label="Penggeser volume"
            />

            <div className="mt-5">
              <CalculationResult
                eyebrow="Estimasi biaya CBAM tahunan"
                value={formatCurrencyIDR(costIDR)}
                badge={commodity.name}
                sublabel={`${tonnes.toLocaleString('id-ID')} t × €${commodity.ratePerTonneEur}/t = €${costEur.toLocaleString('id-ID')} • Kurs €1 ≈ ${formatCurrencyIDR(EUR_TO_IDR)}`}
                rows={[
                  { label: 'Biaya per ton', value: formatCurrencyIDR(perTonneIDR), icon: Coins },
                  { label: 'Biaya per tCO₂e', value: formatCurrencyIDR(perTonneCo2IDR), icon: Gauge, accent: true },
                  { label: 'Biaya per bulan', value: formatCurrencyIDR(costIDR / 12), icon: CalendarClock },
                  {
                    label: 'Emisi tersemat',
                    value: `${formatNumber(embeddedEmissions, 0)} tCO₂e`,
                    icon: Leaf,
                  },
                ]}
              />
              <p className="mt-2 px-1 text-[11px] leading-relaxed text-secondary-text">{commodity.note}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={exportPdf}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-12 bg-primary-green px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-deep-teal disabled:cursor-not-allowed disabled:opacity-70"
              >
                {exporting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                {exporting ? 'Membuat…' : 'Ekspor PDF'}
              </button>
              <button
                onClick={exportExcel}
                disabled={exportingExcel}
                className="inline-flex items-center gap-2 rounded-12 border border-primary-green/30 bg-soft-mint/60 px-4 py-2 text-sm font-medium text-primary-green transition-colors hover:bg-soft-mint disabled:cursor-not-allowed disabled:opacity-70"
              >
                {exportingExcel ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                {exportingExcel ? 'Mengisi Template…' : 'Ekspor Excel (Template UE)'}
              </button>
              <button
                onClick={() => navigate('/dashboard/carbon')}
                className="inline-flex items-center gap-1 rounded-12 border border-border bg-surface px-3 py-2 text-sm font-medium text-secondary-text transition-colors hover:bg-main-bg hover:text-main-text"
              >
                Lihat emisi terpantau <ArrowRight size={14} />
              </button>
            </div>

            <div className="mt-5 rounded-12 border border-warning/20 bg-amber-50 p-3 text-xs leading-relaxed text-warning">
              <span className="font-semibold">Hanya ilustratif.</span> {CBAM_DISCLAIMER}
            </div>
          </div>

          {/* Comparison chart + footprint */}
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
              <h3 className="mb-1 text-lg font-semibold text-main-text">Biaya per Komoditas</h3>
              <p className="mb-4 text-xs text-secondary-text">
                 Pada {tonnes.toLocaleString('id-ID')} t
               </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 5, right: 12, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--color-secondary-text)" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis
                      stroke="var(--color-secondary-text)"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => formatCurrencyIDRCompact(Number(v))}
                      width={70}
                    />
                    <RTooltip
                      formatter={(v) => formatCurrencyIDR(Number(v))}
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="costIDR" radius={[8, 8, 0, 0]}>
                      {comparisonData.map((d, i) => (
                        <Cell
                          key={i}
                          fill={d.selected ? CHART_COLORS[i % CHART_COLORS.length] : MUTED_BAR}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
                  <PieIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-main-text">Porsi eksposur</h3>
                  <p className="text-xs text-secondary-text">Komoditas terpilih</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={38}
                        outerRadius={58}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {donutData.map((d, i) => (
                          <Cell
                            key={i}
                            fill={d.selected ? CHART_COLORS[i % CHART_COLORS.length] : MUTED_BAR}
                          />
                        ))}
                      </Pie>
                      <RTooltip
                        formatter={(v) => formatCurrencyIDRCompact(Number(v))}
                        contentStyle={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-extrabold text-main-text">{selectedShare.toFixed(0)}%</span>
                    <span className="text-[10px] text-secondary-text">{commodity.name}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {comparisonData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: d.selected ? CHART_COLORS[i % CHART_COLORS.length] : MUTED_BAR }}
                      />
                      <span className={d.selected ? 'font-semibold text-main-text' : 'text-secondary-text'}>
                        {d.name}
                      </span>
                      <span className="ml-auto tabular-nums text-secondary-text">
                        {totalComparisonIDR > 0 ? ((d.costIDR / totalComparisonIDR) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-main-text">Umpan data pelaporan</h3>
                  <p className="mt-1 text-sm text-secondary-text">
                    Emisi terpantau Anda untuk {plant} ({period}) berjumlah{' '}
                    <span className="font-semibold text-main-text">{formatTCO2e(monitoredEmissions)}</span>. Inilah
                    jenis catatan yang dapat ditelusuri yang menjadi dasar pelaporan selaras CBAM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Readiness checklist */}
        <Reveal>
          <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-main-text">Daftar Periksa Kesiapan CBAM</h3>
                  <p className="text-xs text-secondary-text">Centang item saat Anda memverifikasinya</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${readinessTone}`}>{READINESS_LABEL[readinessLabel]}</span>
                <span className="rounded-full bg-soft-mint px-3 py-1 text-xs font-semibold text-primary-green">
                  {completed}/{readinessChecklist.length} selesai
                </span>
                {completed > 0 && (
                  <button
                    onClick={() => setChecked({})}
                    className="inline-flex items-center gap-1 rounded-10 border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-secondary-text transition-colors hover:bg-main-bg hover:text-main-text"
                  >
                    <RotateCcw size={13} /> {T.reset}
                  </button>
                )}
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-main-bg">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  completion === 100 ? 'bg-primary-green' : completion >= 50 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${completion}%` }}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {readinessChecklist.map((item) => {
                const done = !!checked[item.id]
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    aria-pressed={done}
                    className={`flex items-start gap-3 rounded-12 border p-4 text-left transition-all ${
                      done
                        ? 'border-primary-green/40 bg-soft-mint/50'
                        : 'border-border bg-surface hover:-translate-y-0.5 hover:border-primary-green/30 hover:bg-main-bg'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-primary-green" />
                    ) : (
                      <Circle size={20} className="mt-0.5 shrink-0 text-secondary-text/50" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-main-text">{item.label}</p>
                      <p className="mt-0.5 text-xs text-secondary-text">{item.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {nextItem && (
              <div className="mt-5 flex items-start gap-3 rounded-12 border border-primary-green/20 bg-soft-mint/40 p-4 text-xs leading-relaxed text-secondary-text">
                <ArrowRight size={16} className="mt-0.5 shrink-0 text-primary-green" />
                <span>
                  <span className="font-semibold text-main-text">Langkah berikutnya:</span> {nextItem.label} —{' '}
                  {nextItem.description}
                </span>
              </div>
            )}

            <div className="mt-4 flex items-start gap-3 rounded-12 border border-border bg-main-bg p-4 text-xs leading-relaxed text-secondary-text">
              <Info size={16} className="mt-0.5 shrink-0 text-deep-teal" />
              <span>
                Daftar periksa ini adalah alat bantu, bukan sertifikasi kepatuhan. Konfirmasikan
                kewajiban Anda dengan Komisi Eropa dan penasihat yang berkualifikasi.
              </span>
            </div>
          </div>
        </Reveal>

        <div className="flex items-center gap-3">
          <Factory size={16} className="text-secondary-text" />
          <span className="text-xs text-secondary-text">
            Bukan sertifikasi kepatuhan. Konfirmasikan kewajiban Anda dengan Komisi Eropa dan
            penasihat yang berkualifikasi.
          </span>
        </div>
      </main>
    </>
  )
}

export default CbamPage
