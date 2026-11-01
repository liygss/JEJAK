import { useMemo, useState } from 'react'
import {
  PiggyBank,
  Calculator,
  TrendingUp,
  Building2,
  HandCoins,
  ArrowRight,
  Info,
  Inbox,
  Target,
  Wallet,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import { useSidebar } from '../components/layout/DashboardLayout'
import KpiCard from '../components/dashboard/KpiCard'
import CalculationResult from '../components/ui/CalculationResult'
import { Stagger, StaggerItem, Reveal } from '../components/ui/Reveal'
import { useFilters } from '../lib/FiltersContext'
import { energyRecords } from '../data/energy'
import { insights } from '../data/insights'
import { calculateTotalCost } from '../lib/calculations'
import { formatCurrencyIDR, formatCurrencyIDRCompact } from '../lib/formatters'
import { SEVERITY_LABEL, areaLabel } from '../lib/id'

const SAVINGS_TARGETS = [2, 3, 5, 8, 10]
const BEST_PRACTICE_LOW = 3
const BEST_PRACTICE_HIGH = 5
const CURRENT_BENCHMARK = 2

const EnergySavingsPage = () => {
  const { openSidebar } = useSidebar()
  const navigate = useNavigate()
  const { filterEnergy } = useFilters()

  const periodCost = useMemo(() => calculateTotalCost(filterEnergy(energyRecords)), [filterEnergy])
  const annualizedCost = periodCost // treat selected period total as the annual baseline

  const [annualCostOverride, setAnnualCostOverride] = useState<number | null>(null)
  const annualCost = annualCostOverride ?? Math.round(annualizedCost)
  const [savingsPct, setSavingsPct] = useState(5)
  const [providerSplit, setProviderSplit] = useState(50)

  const totalSavingsIDR = (annualCost * savingsPct) / 100
  const providerShareIDR = (totalSavingsIDR * providerSplit) / 100
  const clientShareIDR = totalSavingsIDR - providerShareIDR

  const opportunityInsights = useMemo(
    () => insights.filter((i) => i.estimatedSavingsIDR != null).sort((a, b) => (b.estimatedSavingsIDR ?? 0) - (a.estimatedSavingsIDR ?? 0)),
    []
  )
  const totalOpportunity = opportunityInsights.reduce((s, i) => s + (i.estimatedSavingsIDR ?? 0), 0)
  const openCount = insights.filter((i) => i.status === 'New').length

  return (
    <>
      <AppHeader
        title="Penghematan Energi"
        subtitle="Temukan pemborosan dan modelkan penghematan bersama"
        onMenuClick={openSidebar}
      />
      <main className="space-y-6 p-4 md:p-6">
        {/* Context banner */}
        <Reveal>
          <div className="rounded-18 border border-border bg-gradient-to-br from-soft-mint/70 to-surface p-5 shadow-sm md:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-12 bg-white text-primary-green shadow-sm">
                <PiggyBank size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-main-text">Pemborosan energi & penghematan bersama</h2>
                <p className="mt-1 text-sm leading-relaxed text-secondary-text">
                  Penghematan energi industri seringkali jauh di bawah praktik terbaik. JEJAK memodelkan skema
                  <span className="font-medium text-main-text"> penghematan bersama (gaya ESCO) </span>
                  di mana penyedia dibayar dari sebagian penghematan yang dihasilkan.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* KPI strip */}
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
          <StaggerItem>
            <KpiCard
              title="Biaya Energi (Periode)"
              value={formatCurrencyIDRCompact(periodCost)}
              numericValue={periodCost}
              format={(n) => formatCurrencyIDRCompact(n)}
              icon={Calculator}
              tooltip="Total biaya energi untuk periode yang dipilih."
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              title="Estimasi Penghematan"
              value={formatCurrencyIDRCompact(totalSavingsIDR)}
              numericValue={totalSavingsIDR}
              format={(n) => formatCurrencyIDRCompact(n)}
              icon={TrendingUp}
              tooltip="Estimasi penghematan pada target dan baseline yang dipilih."
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              title="Sinyal Peluang"
              value={`${opportunityInsights.length}`}
              numericValue={opportunityInsights.length}
              format={(n) => `${n}`}
              icon={Target}
              tooltip="Wawasan dengan peluang penghematan terestimasi."
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              title="Wawasan Terbuka"
              value={`${openCount}`}
              numericValue={openCount}
              format={(n) => `${n}`}
              icon={HandCoins}
              tooltip="Wawasan yang belum ditandai sebagai ditinjau."
            />
          </StaggerItem>
        </Stagger>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          {/* Calculator */}
          <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6 xl:col-span-3">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
                <Calculator size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-main-text">Kalkulator Penghematan Bersama</h3>
                <p className="text-xs text-secondary-text">Model ESCO • keluaran dalam IDR</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="savings-cost" className="mb-1.5 block text-xs font-medium text-secondary-text">
                  Biaya energi tahunan (IDR) — diisi otomatis dari periode yang dipilih
                </label>
                <input
                  id="savings-cost"
                  type="number"
                  min={0}
                  value={annualCost}
                  onChange={(e) => setAnnualCostOverride(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-12 border border-border px-3 py-2 text-sm text-main-text focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="savings-pct" className="text-xs font-medium text-secondary-text">
                    Target penghematan
                  </label>
                  <span className="text-xs font-semibold text-primary-green">{savingsPct}%</span>
                </div>
                <input
                  id="savings-pct"
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={savingsPct}
                  onChange={(e) => setSavingsPct(Number(e.target.value))}
                  className="w-full accent-[var(--color-primary-green)]"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {SAVINGS_TARGETS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSavingsPct(t)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        savingsPct === t
                          ? 'bg-primary-green text-white'
                          : 'border border-border bg-main-bg text-secondary-text hover:text-main-text'
                      }`}
                    >
                      {t}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="savings-split" className="text-xs font-medium text-secondary-text">
                    Porsi penyedia atas penghematan
                  </label>
                  <span className="text-xs font-semibold text-primary-green">{providerSplit}%</span>
                </div>
                <input
                  id="savings-split"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={providerSplit}
                  onChange={(e) => setProviderSplit(Number(e.target.value))}
                  className="w-full accent-[var(--color-primary-green)]"
                />
              </div>
            </div>

            <div className="mt-6">
              <CalculationResult
                eyebrow="Total penghematan"
                value={formatCurrencyIDRCompact(totalSavingsIDR)}
                badge={`${savingsPct}% target`}
                sublabel={`${formatCurrencyIDR(annualCost)} baseline tahunan × ${savingsPct}%`}
                rows={[
                  {
                    label: 'Porsi Anda',
                    value: formatCurrencyIDRCompact(clientShareIDR),
                    hint: `(${100 - providerSplit}%)`,
                    icon: Wallet,
                    accent: true,
                  },
                  {
                    label: 'Porsi penyedia',
                    value: formatCurrencyIDRCompact(providerShareIDR),
                    hint: `(${providerSplit}%)`,
                    icon: HandCoins,
                  },
                ]}
              />

              {totalSavingsIDR > 0 && (
                <div className="mt-3">
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-main-bg">
                    <div
                      className="h-full bg-primary-green transition-all duration-300"
                      style={{ width: `${100 - providerSplit}%` }}
                    />
                    <div
                      className="h-full bg-deep-teal/70 transition-all duration-300"
                      style={{ width: `${providerSplit}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-secondary-text">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary-green" /> Anda {100 - providerSplit}%
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-deep-teal/70" /> Penyedia {providerSplit}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-12 border border-warning/20 bg-amber-50 p-3 text-xs leading-relaxed text-warning">
              <span className="font-semibold">Estimasi.</span> Bukan penawaran finansial atau jaminan penghematan.
            </div>
          </div>

          {/* Benchmark + explainer */}
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
              <h3 className="mb-1 text-lg font-semibold text-main-text">Tolok Ukur Penghematan</h3>
              <p className="mb-5 text-xs text-secondary-text">Saat ini vs rentang praktik terbaik</p>

              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs text-secondary-text">
                    <span>Saat ini</span>
                    <span className="font-semibold text-main-text">{CURRENT_BENCHMARK}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-main-bg">
                    <div className="h-full rounded-full bg-secondary-text/50" style={{ width: `${(CURRENT_BENCHMARK / 10) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs text-secondary-text">
                    <span>Target Anda</span>
                    <span className="font-semibold text-primary-green">{savingsPct}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-main-bg">
                    <div className="h-full rounded-full bg-primary-green" style={{ width: `${(savingsPct / 10) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs text-secondary-text">
                    <span>Rentang praktik terbaik</span>
                    <span className="font-semibold text-main-text">
                      {BEST_PRACTICE_LOW}–{BEST_PRACTICE_HIGH}%
                    </span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-main-bg">
                    <div
                      className="absolute h-full rounded-full bg-deep-teal/70"
                      style={{
                        left: `${(BEST_PRACTICE_LOW / 10) * 100}%`,
                        width: `${((BEST_PRACTICE_HIGH - BEST_PRACTICE_LOW) / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-12 border border-border bg-main-bg p-3 text-xs leading-relaxed text-secondary-text">
                <Info size={16} className="mt-0.5 shrink-0 text-deep-teal" />
                <span>Perbandingan indikatif. Penghematan aktual bergantung pada operasi Anda dan langkah yang diambil.</span>
              </div>
            </div>

            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-main-text">Cara kerja penghematan bersama</h3>
                  <p className="mt-1 text-sm leading-relaxed text-secondary-text">
                    Penyedia membiayai dan melaksanakan langkah efisiensi, lalu dibayar dengan sebagian dari
                    penghematan yang diverifikasi. Biaya bersih Anda tetap di bawah penghematan yang Anda
                    peroleh — sehingga proyek dirancang untuk membiayai dirinya sendiri sejak hari pertama.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <Reveal>
          <div className="rounded-18 border border-border bg-surface shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 md:p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-main-text">Peluang Penghematan</h3>
                  <p className="text-xs text-secondary-text">
                    Rekomendasi berbasis aturan • indikatif
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard/insights')}
                className="inline-flex items-center gap-1 rounded-12 border border-border bg-surface px-3 py-2 text-sm font-medium text-secondary-text transition-colors hover:bg-main-bg hover:text-main-text"
              >
                Buka Wawasan AI <ArrowRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-border">
              {opportunityInsights.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Inbox size={28} className="text-secondary-text/50" />
                  <p className="mt-3 text-sm text-secondary-text">Tidak ada peluang penghematan pada data saat ini.</p>
                </div>
              ) : (
                opportunityInsights.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-main-text">{item.title}</p>
                      <p className="mt-0.5 text-xs text-secondary-text">
                        {areaLabel(item.area)} • Keparahan {SEVERITY_LABEL[item.severity]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary-green">
                        {formatCurrencyIDR(item.estimatedSavingsIDR ?? 0)}
                      </p>
                      <p className="text-[11px] text-secondary-text">estimasi / periode</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {opportunityInsights.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-4 md:px-6">
                <span className="text-sm text-secondary-text">Total peluang terindikasi</span>
                <span className="text-lg font-extrabold text-main-text">{formatCurrencyIDR(totalOpportunity)}</span>
              </div>
            )}
          </div>
        </Reveal>
      </main>
    </>
  )
}

export default EnergySavingsPage
