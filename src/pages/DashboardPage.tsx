import { useState } from 'react'
import { Zap, Leaf, DollarSign, Target, PiggyBank, Activity, TriangleAlert, CalendarDays } from 'lucide-react'
import AppHeader from '../components/layout/AppHeader'
import { useSidebar } from '../components/layout/DashboardLayout'
import KpiCard from '../components/dashboard/KpiCard'
import EnergyCarbonChart from '../components/dashboard/EnergyCarbonChart'
import EnergyBreakdown from '../components/dashboard/EnergyBreakdown'
import AiInsightCard from '../components/dashboard/AiInsightCard'
import DeviceStatus from '../components/dashboard/DeviceStatus'
import RecentActivity from '../components/dashboard/RecentActivity'
import { Stagger, StaggerItem } from '../components/ui/Reveal'
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton'
import { energyRecords } from '../data/energy'
import { carbonRecords as carbonData } from '../data/carbon'
import { insights as initialInsights } from '../data/insights'
import type { Insight } from '../data/types'
import { useFilters } from '../lib/FiltersContext'
import { useToast } from '../components/ui/Toast'
import {
  calculateTotalEnergy,
  calculateTotalCarbon,
  calculateTotalCost,
  calculateRealizedSavings,
  countAboveBaseline,
  getDailyCarbonSeries,
  getDailyCostSeries,
  getDailyEnergySeries,
  getEfficiencyScore,
  getPeakDay,
  getTrendDelta,
} from '../lib/calculations'
import { formatCurrencyIDR, formatMWh, formatTCO2e } from '../lib/formatters'

const DashboardPage = () => {
  const { openSidebar } = useSidebar()
  const { filterEnergy, filterCarbon, loading } = useFilters()
  const { toast } = useToast()
  const [insights, setInsights] = useState<Insight[]>(initialInsights)

  const handleMarkReviewed = (id: string) => {
    setInsights((prev) =>
      prev.map((insight) =>
        insight.id === id ? { ...insight, status: 'Reviewed' as const } : insight
      )
    )
    toast({ title: 'Insight ditandai sebagai ditinjau', variant: 'success' })
  }

  const filteredEnergy = filterEnergy(energyRecords)
  const filteredCarbon = filterCarbon(carbonData)

  const totalEnergy = calculateTotalEnergy(filteredEnergy)
  const totalCarbon = calculateTotalCarbon(filteredCarbon)
  const totalCost = calculateTotalCost(filteredEnergy)
  const potentialSavings = insights.reduce((sum, i) => sum + (i.estimatedSavingsIDR ?? 0), 0)
  const realizedSavings = calculateRealizedSavings(filteredEnergy)

  const energySeries = getDailyEnergySeries(filteredEnergy)
  const carbonSeries = getDailyCarbonSeries(filteredCarbon)
  const costSeries = getDailyCostSeries(filteredEnergy)

  const energyDelta = getTrendDelta(energySeries)
  const carbonDelta = getTrendDelta(carbonSeries)
  const costDelta = getTrendDelta(costSeries)

  const efficiency = getEfficiencyScore(filteredEnergy)
  const aboveBaseline = countAboveBaseline(filteredEnergy)
  const peak = getPeakDay(filteredEnergy)

  return (
    <>
      <AppHeader title="Ringkasan Industri" subtitle="Kinerja energi dan karbon Anda sekilas" onMenuClick={openSidebar} />
      <main className="space-y-6 p-4 md:p-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-5">
            <StaggerItem>
              <KpiCard
                title="Total Konsumsi Energi"
                value={formatMWh(totalEnergy)}
                numericValue={totalEnergy}
                format={(n) => formatMWh(n)}
                icon={Zap}
                trend={{ value: energyDelta, label: 'vs periode sebelumnya' }}
                lowerIsBetter
                sparkline={energySeries.map((d) => d.value)}
                sparkColor="#14B8A6"
                tooltip="Total konsumsi energi terukur di seluruh area yang dipantau untuk periode yang dipilih."
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Emisi Karbon"
                value={formatTCO2e(totalCarbon)}
                numericValue={totalCarbon}
                format={(n) => formatTCO2e(n)}
                icon={Leaf}
                trend={{ value: carbonDelta, label: 'vs periode sebelumnya' }}
                lowerIsBetter
                sparkline={carbonSeries.map((d) => d.value)}
                sparkColor="#059669"
                tooltip="Estimasi emisi karbon dari konsumsi energi menggunakan faktor emisi yang dikonfigurasi."
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Biaya Energi"
                value={formatCurrencyIDR(totalCost)}
                numericValue={totalCost}
                format={(n) => formatCurrencyIDR(n)}
                icon={DollarSign}
                trend={{ value: costDelta, label: 'vs periode sebelumnya' }}
                lowerIsBetter
                sparkline={costSeries.map((d) => d.value)}
                sparkColor="#0F766E"
                tooltip="Estimasi biaya energi berdasarkan konsumsi dan tarif dalam Rupiah Indonesia."
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Potensi Penghematan Energi"
                value={formatCurrencyIDR(potentialSavings)}
                numericValue={potentialSavings}
                format={(n) => formatCurrencyIDR(n)}
                icon={Target}
                subtitle="dari insight terbuka"
                accent
                tooltip="Jumlah estimasi penghematan dari insight AI terbuka. Hanya indikatif, bukan hasil tervalidasi."
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                title="Estimasi Biaya Sudah Dihemat"
                value={formatCurrencyIDR(realizedSavings)}
                numericValue={realizedSavings}
                format={(n) => formatCurrencyIDR(n)}
                icon={PiggyBank}
                subtitle="vs baseline periode ini"
                accent
                tooltip="Estimasi biaya yang sudah dihemat dari hari-hari dengan konsumsi di bawah baseline. Dihitung dari selisih konsumsi × tarif efektif harian."
              />
            </StaggerItem>
          </Stagger>
        )}

        {!loading && (
          <div className="grid grid-cols-1 gap-4 rounded-18 border border-border bg-surface p-4 shadow-sm sm:grid-cols-3 md:gap-6 md:p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-secondary-text">
                  <Activity size={14} className="text-primary-green" /> Skor efisiensi
                </span>
                <span className="text-sm font-bold text-main-text">{efficiency}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-main-bg">
                <div
                  className="h-full rounded-full bg-primary-green transition-all duration-700"
                  style={{ width: `${efficiency}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-secondary-text">Pembacaan dalam baseline</p>
            </div>
            <div className="flex items-center gap-3 sm:border-l sm:border-border sm:pl-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-amber-50 text-warning">
                <TriangleAlert size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-main-text">{aboveBaseline} pembacaan</p>
                <p className="text-[11px] text-secondary-text">Di atas baseline</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:border-l sm:border-border sm:pl-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-teal-50 text-deep-teal">
                <CalendarDays size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-main-text">
                  {peak ? formatMWh(peak.consumptionMWh) : '—'}
                </p>
                <p className="text-[11px] text-secondary-text">
                  {peak ? `Hari puncak • ${peak.date}` : 'Hari puncak'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="h-full xl:col-span-2">
            {loading ? <SkeletonChart /> : <EnergyCarbonChart />}
          </div>
          <div className="h-full">
            {loading ? <SkeletonCard /> : <AiInsightCard insights={insights} onMarkReviewed={handleMarkReviewed} />}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <EnergyBreakdown />
              <DeviceStatus />
              <RecentActivity />
            </>
          )}
        </div>
      </main>
    </>
  )
}

export default DashboardPage
