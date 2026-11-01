import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Activity,
  Cpu,
  BellRing,
  Radio,
  Gauge,
  Timer,
  TrendingUp,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import AppHeader from '../../components/layout/AppHeader'
import { useAdminSidebar } from '../../components/layout/AdminLayout'
import KpiCard from '../../components/dashboard/KpiCard'
import FleetStatusDonut from '../../components/admin/FleetStatusDonut'
import DeviceTypeBar from '../../components/admin/DeviceTypeBar'
import AdminActivityFeed from '../../components/admin/AdminActivityFeed'
import { Stagger, StaggerItem, Reveal } from '../../components/ui/Reveal'
import {
  telemetrySeries,
  getFleetSummary,
  fleetUptimeSeries,
  getAvgLatency,
  getAvgPacketLoss,
} from '../../data/admin'

type TelemetryView = 'throughput' | 'uptime'

const FleetOverviewPage = () => {
  const { openSidebar } = useAdminSidebar()
  const reduce = useReducedMotion()
  const summary = useMemo(() => getFleetSummary(), [])
  const avgLatency = useMemo(() => getAvgLatency(), [])
  const avgPacketLoss = useMemo(() => getAvgPacketLoss(), [])
  const [view, setView] = useState<TelemetryView>('throughput')

  const views: { id: TelemetryView; label: string }[] = [
    { id: 'throughput', label: 'Laju Data' },
    { id: 'uptime', label: 'Ketersediaan (30 hari)' },
  ]

  const uptimeTarget = 99

  return (
    <>
      <AppHeader
        title="Admin Armada AIoT"
        subtitle="Kesehatan armada & telemetri"
        role="admin"
        onMenuClick={openSidebar}
      />
      <main className="space-y-6 p-4 md:p-6">
        {/* Context banner */}
        <Reveal>
          <div className="relative overflow-hidden rounded-18 border border-border bg-gradient-to-br from-teal-50 via-surface to-surface p-5 shadow-sm md:p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-deep-teal/10 blur-2xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-12 bg-white text-deep-teal shadow-sm">
                <Radio size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-main-text">Pemantauan Armada AIoT</h2>
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-deep-teal">
                    Konsol Admin
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-secondary-text">
                  Pantau kesehatan meteran, sensor, gateway, dan pengendali yang tersambung dalam
                  satu konsol.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* KPI strip */}
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
          <StaggerItem>
            <KpiCard
              title="Perangkat Aktif"
              value={`${summary.online} / ${summary.total}`}
              numericValue={summary.online}
              format={(n) => `${n} / ${summary.total}`}
              icon={Cpu}
              accent
              subtitle={`${summary.warning} peringatan • ${summary.offline} mati`}
              sparkline={fleetUptimeSeries.map((d) => d.uptime)}
              sparkColor="#059669"
              tooltip="Perangkat yang melapor dalam jendela yang diharapkan."
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              title="Rata-rata Ketersediaan"
              value={`${summary.avgUptime}%`}
              numericValue={summary.avgUptime}
              format={(n) => `${n}%`}
              icon={Gauge}
              subtitle="Target 99%"
              sparkline={fleetUptimeSeries.map((d) => d.uptime)}
              sparkColor="#0F766E"
              tooltip="Rata-rata ketersediaan seluruh armada."
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              title="Rata-rata Latensi"
              value={`${avgLatency} ms`}
              numericValue={avgLatency}
              format={(n) => `${Math.round(n)} ms`}
              icon={Timer}
              subtitle={`${avgPacketLoss}% kehilangan paket`}
              tooltip="Rata-rata latensi bolak-balik pada perangkat yang tersambung."
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              title="Peringatan Terbuka"
              value={`${summary.openAlerts}`}
              numericValue={summary.openAlerts}
              format={(n) => `${n}`}
              icon={BellRing}
              subtitle="Lihat halaman Peringatan"
              tooltip="Total peringatan perangkat."
            />
          </StaggerItem>
        </Stagger>

        {/* Telemetry chart + fleet status donut */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Reveal className="xl:col-span-2">
            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-lg font-semibold text-main-text">
                    {view === 'throughput' ? 'Laju Data Telemetri' : 'Tren Ketersediaan Armada'}
                  </h3>
                  <p className="text-xs text-secondary-text">
                    {view === 'throughput'
                      ? 'Pembacaan per jam • 24 jam terakhir'
                      : 'Ketersediaan harian • 30 hari terakhir'}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-12 bg-main-bg p-1">
                  {views.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setView(v.id)}
                      className={`relative rounded-10 px-3 py-1.5 text-sm font-medium transition-colors ${
                        view === v.id ? 'text-main-text' : 'text-secondary-text hover:text-main-text'
                      }`}
                    >
                      {view === v.id && !reduce && (
                        <motion.span
                          layoutId="fleet-view-pill"
                          className="absolute inset-0 rounded-10 bg-surface shadow-sm"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      )}
                      {view === v.id && reduce && (
                        <span className="absolute inset-0 rounded-10 bg-surface shadow-sm" />
                      )}
                      <span className="relative z-10">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {view === 'throughput' ? (
                    <AreaChart data={telemetrySeries} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                      <defs>
                        <linearGradient id="fleetTelemetry" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0F766E" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#0F766E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="hour" stroke="var(--color-secondary-text)" tick={{ fontSize: 10 }} interval={3} />
                      <YAxis stroke="var(--color-secondary-text)" tick={{ fontSize: 11 }} width={48} />
                      <RTooltip
                        formatter={(v) => [`${v} pembacaan`, 'Laju Data']}
                        contentStyle={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="readings"
                        stroke="#0F766E"
                        strokeWidth={2}
                        fill="url(#fleetTelemetry)"
                      />
                    </AreaChart>
                  ) : (
                    <AreaChart data={fleetUptimeSeries} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                      <defs>
                        <linearGradient id="fleetUptime" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="day" stroke="var(--color-secondary-text)" tick={{ fontSize: 10 }} interval={4} />
                      <YAxis
                        domain={['dataMin - 1', 100]}
                        stroke="var(--color-secondary-text)"
                        tick={{ fontSize: 11 }}
                        width={48}
                        unit="%"
                      />
                      <RTooltip
                        formatter={(v) => [`${v}%`, 'Ketersediaan']}
                        contentStyle={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <ReferenceLine
                        y={uptimeTarget}
                        stroke="var(--color-warning)"
                        strokeDasharray="5 4"
                        label={{ value: 'Target referensi 99%', position: 'insideTopRight', fontSize: 10, fill: 'var(--color-warning)' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="uptime"
                        stroke="#14B8A6"
                        strokeWidth={2}
                        fill="url(#fleetUptime)"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="flex h-full flex-col rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-main-text">Status Armada</h3>
                <span className="text-xs text-secondary-text">Semua perangkat</span>
              </div>
              <FleetStatusDonut
                counts={{
                  Online: summary.online,
                  Warning: summary.warning,
                  Offline: summary.offline,
                  Maintenance: summary.maintenance,
                }}
                total={summary.total}
              />
            </div>
          </Reveal>
        </div>

        {/* Distribution + activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal>
            <div className="flex h-full flex-col rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-main-text">Perangkat per Tipe</h3>
                <p className="text-xs text-secondary-text">Distribusi di seluruh armada</p>
              </div>
              <DeviceTypeBar />
            </div>
          </Reveal>
          <Reveal className="lg:col-span-2">
            <div className="flex h-full flex-col rounded-18 border border-border bg-surface p-4 shadow-sm md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-main-text">Aktivitas Terbaru</h3>
                  <p className="text-xs text-secondary-text">Kejadian konsol admin</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-soft-mint px-2.5 py-1 text-xs font-medium text-primary-green">
                  <TrendingUp size={13} /> Langsung
                </span>
              </div>
              <AdminActivityFeed />
            </div>
          </Reveal>
        </div>

        <div className="flex items-start gap-3 rounded-12 border border-border bg-main-bg p-4 text-xs leading-relaxed text-secondary-text">
          <Activity size={16} className="mt-0.5 shrink-0 text-deep-teal" />
          <span>
            Status perangkat, telemetri, peringatan, dan penanda perawatan bersifat indikatif serta
            tidak mewakili perangkat keras, postur keamanan, atau operasi sebenarnya.
          </span>
        </div>
      </main>
    </>
  )
}

export default FleetOverviewPage
