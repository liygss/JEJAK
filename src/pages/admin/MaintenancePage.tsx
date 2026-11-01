import { useMemo, useState } from 'react'
import {
  Wrench,
  Radio,
  Battery,
  Signal,
  WifiOff,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Timer,
  Gauge,
  CircleAlert,
} from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import { useAdminSidebar } from '../../components/layout/AdminLayout'
import { Reveal } from '../../components/ui/Reveal'
import { useToast } from '../../components/ui/Toast'
import MaintenanceCard from '../../components/admin/MaintenanceCard'
import { getMaintenanceQueue, type FleetDevice } from '../../data/admin'
import { PRIORITY_LABEL, DATA_QUALITY_LABEL, locationLabel } from '../../lib/id'
import { PRIORITY_CONFIG, type Priority } from './adminStyles'

type Reason = { label: string; icon: typeof Battery }

function getReasons(d: FleetDevice): Reason[] {
  const reasons: Reason[] = []
  if (d.status === 'Offline') reasons.push({ label: 'Mati', icon: WifiOff })
  if (d.batteryPct != null && d.batteryPct < 25) reasons.push({ label: `Baterai ${d.batteryPct}%`, icon: Battery })
  if (d.signalPct < 50) reasons.push({ label: `Sinyal ${d.signalPct}%`, icon: Signal })
  if (d.dataQuality !== 'Good') reasons.push({ label: `Data ${DATA_QUALITY_LABEL[d.dataQuality]}`, icon: CalendarClock })
  if (reasons.length === 0) reasons.push({ label: 'Servis terjadwal', icon: CalendarClock })
  return reasons
}

function getPriority(d: FleetDevice): Priority {
  if (d.status === 'Offline' || (d.batteryPct != null && d.batteryPct < 20)) return 'Critical'
  if (d.status === 'Maintenance') return 'Scheduled'
  return 'Monitor'
}

const COLUMNS: Priority[] = ['Critical', 'Scheduled', 'Monitor']
const LOCATION_FILTERS = ['All', 'Production Line', 'Utility Area', 'Packaging', 'Warehouse', 'HVAC Room', 'Main Substation'] as const
type LocationFilter = (typeof LOCATION_FILTERS)[number]

const MaintenancePage = () => {
  const { openSidebar } = useAdminSidebar()
  const { toast } = useToast()
  const queue = useMemo(() => getMaintenanceQueue(), [])
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [location, setLocation] = useState<LocationFilter>('All')

  const filtered = useMemo(
    () => (location === 'All' ? queue : queue.filter((d) => d.location === location)),
    [queue, location]
  )

  const grouped = useMemo(() => {
    const map: Record<Priority, FleetDevice[]> = { Critical: [], Scheduled: [], Monitor: [] }
    filtered.forEach((d) => map[getPriority(d)].push(d))
    return map
  }, [filtered])

  const markDone = (d: FleetDevice) => {
    setDone((prev) => ({ ...prev, [d.id]: !prev[d.id] }))
    toast({
      title: done[d.id] ? 'Perintah kerja dibuka kembali' : 'Perintah kerja selesai',
      description: `${d.name} ${done[d.id] ? 'dikembalikan ke antrean' : 'dihapus dari antrean'}.`,
      variant: done[d.id] ? 'info' : 'success',
    })
  }

  const openCount = filtered.length - Object.values(done).filter(Boolean).length
  const criticalCount = grouped.Critical.length
  const avgUptime =
    filtered.length > 0
      ? Math.round((filtered.reduce((s, d) => s + d.uptimePct, 0) / filtered.length) * 10) / 10
      : 0
  const totalMinutes = filtered.reduce((s, d) => s + (d.estimatedMinutes ?? 0), 0)
  const locationCounts = useMemo(() => {
    const counts: Record<string, number> = { All: queue.length }
    queue.forEach((d) => {
      counts[d.location] = (counts[d.location] ?? 0) + 1
    })
    return counts
  }, [queue])

  return (
    <>
      <AppHeader
        title="Perawatan"
        subtitle="Perangkat yang kemungkinan memerlukan kunjungan lapangan"
        role="admin"
        onMenuClick={openSidebar}
      />
      <main className="space-y-6 p-4 md:p-6">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-18 border border-border bg-surface p-4 shadow-sm md:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-teal-50 text-deep-teal">
                <Wrench size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-main-text">Papan Perawatan</h2>
                <p className="text-xs text-secondary-text">
                  {filtered.length} perangkat ditandai • {COLUMNS.length} kolom
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {COLUMNS.map((p) => (
                <span
                  key={p}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${PRIORITY_CONFIG[p].border} ${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color}`}
                >
                  <span className={`h-2 w-2 rounded-full ${PRIORITY_CONFIG[p].dot}`} />
                  {PRIORITY_LABEL[p]} · {grouped[p].length}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* KPI strip */}
        <Reveal>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-secondary-text">
                <ClipboardList size={13} className="text-deep-teal" /> Antrean terbuka
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums text-main-text">{openCount}</p>
              <p className="text-[11px] text-secondary-text">dari {filtered.length} ditandai</p>
            </div>
            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-secondary-text">
                <CircleAlert size={13} className="text-danger" /> Perlu tindakan segera
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums text-danger">{criticalCount}</p>
              <p className="text-[11px] text-secondary-text">perangkat kritis</p>
            </div>
            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-secondary-text">
                <Gauge size={13} className="text-primary-green" /> Rata-rata ketersediaan
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums text-main-text">{avgUptime}%</p>
              <p className="text-[11px] text-secondary-text">perangkat dalam antrean</p>
            </div>
            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-secondary-text">
                <Timer size={13} className="text-warning" /> Estimasi durasi total
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums text-main-text">
                {Math.floor(totalMinutes / 60)}j {totalMinutes % 60}m
              </p>
              <p className="text-[11px] text-secondary-text">waktu lapangan</p>
            </div>
          </div>
        </Reveal>

        {/* Location filter */}
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 rounded-18 border border-border bg-surface px-4 py-3 shadow-sm">
            <span className="text-xs font-medium text-secondary-text">Lokasi:</span>
            {LOCATION_FILTERS.map((loc) => {
              const count = locationCounts[loc] ?? 0
              if (count === 0) return null
              const active = location === loc
              return (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'border-primary-green/30 bg-soft-mint text-primary-green'
                      : 'border-border bg-main-bg text-secondary-text hover:text-main-text'
                  }`}
                >
                  {loc === 'All' ? 'Semua' : locationLabel(loc)}
                  <span
                    className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                      active ? 'bg-white/70' : 'bg-surface'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {COLUMNS.map((priority) => {
            const cfg = PRIORITY_CONFIG[priority]
            const devices = grouped[priority]
            return (
              <Reveal key={priority}>
                <div className="flex h-full flex-col rounded-18 border border-border bg-main-bg/40">
                  <div className="flex items-center justify-between gap-2 border-b border-border p-4">
                    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${cfg.color}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                      {PRIORITY_LABEL[priority]}
                    </span>
                    <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold tabular-nums text-secondary-text">
                      {devices.length}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    {devices.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                        <CheckCircle2 size={22} className="text-secondary-text/40" />
                        <p className="mt-2 text-xs text-secondary-text">Tidak ada di sini</p>
                      </div>
                    ) : (
                      devices.map((d) => (
                        <MaintenanceCard
                          key={d.id}
                          device={d}
                          reasons={getReasons(d)}
                          done={!!done[d.id]}
                          onToggleDone={markDone}
                        />
                      ))
                    )}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <div className="flex items-start gap-3 rounded-12 border border-border bg-main-bg p-4 text-xs leading-relaxed text-secondary-text">
          <Radio size={16} className="mt-0.5 shrink-0 text-deep-teal" />
          <span>Penanda perawatan bersifat indikatif dan bukan perintah kerja resmi.</span>
        </div>
      </main>
    </>
  )
}

export default MaintenancePage
