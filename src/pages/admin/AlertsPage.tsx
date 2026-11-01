import { useMemo, useState } from 'react'
import { BellRing, CheckCheck, Radio, ShieldAlert, CircleAlert } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import { useAdminSidebar } from '../../components/layout/AdminLayout'
import { Reveal } from '../../components/ui/Reveal'
import { Stagger, StaggerItem } from '../../components/ui/Reveal'
import { useToast } from '../../components/ui/Toast'
import AlertTimeline from '../../components/admin/AlertTimeline'
import { fleetAlerts, getAlertCounts, type AlertSeverity, type FleetAlert } from '../../data/admin'
import { ALERT_SEVERITY_LABEL } from '../../lib/id'

type SeverityFilter = 'All' | AlertSeverity

const SEVERITY_FILTERS: SeverityFilter[] = ['All', 'High', 'Medium', 'Low']

const AlertsPage = () => {
  const { openSidebar } = useAdminSidebar()
  const { toast } = useToast()
  const [acked, setAcked] = useState<Record<string, boolean>>({})
  const [severity, setSeverity] = useState<SeverityFilter>('All')

  const counts = useMemo(() => getAlertCounts(), [])

  const filteredAlerts = useMemo(
    () => fleetAlerts.filter((a) => severity === 'All' || a.severity === severity),
    [severity]
  )

  const ackedCount = useMemo(() => fleetAlerts.filter((a) => acked[a.id]).length, [acked])
  const openCount = fleetAlerts.length - ackedCount

  const toggleAlert = (a: FleetAlert) => {
    const willAck = !acked[a.id]
    setAcked((prev) => ({ ...prev, [a.id]: willAck }))
    toast({
      title: willAck ? 'Peringatan diakui' : 'Peringatan dibuka kembali',
      description: `${a.title} ${willAck ? 'ditandai sebagai diakui' : 'dikembalikan ke terbuka'}.`,
      variant: willAck ? 'success' : 'info',
    })
  }

  const kpis = [
    { label: 'Terbuka', value: openCount, icon: BellRing, tone: 'text-warning bg-amber-50' },
    { label: 'Keparahan tinggi', value: counts.high, icon: ShieldAlert, tone: 'text-danger bg-red-50' },
    { label: 'Sedang', value: counts.medium, icon: CircleAlert, tone: 'text-warning bg-amber-50' },
    { label: 'Diakui', value: ackedCount, icon: CheckCheck, tone: 'text-primary-green bg-soft-mint' },
  ]

  return (
    <>
      <AppHeader title="Peringatan" subtitle="Peringatan perangkat armada" role="admin" onMenuClick={openSidebar} />
      <main className="space-y-6 p-4 md:p-6">
        <Stagger className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-4">
          {kpis.map((k) => {
            const Icon = k.icon
            return (
              <StaggerItem key={k.label}>
                <div className="flex items-center gap-3 rounded-18 border border-border bg-surface p-4 shadow-sm md:p-5">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-12 ${k.tone}`}>
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-2xl font-bold tabular-nums text-main-text">{k.value}</p>
                    <p className="text-xs text-secondary-text">{k.label}</p>
                  </div>
                </div>
              </StaggerItem>
            )
          })}
        </Stagger>

        <Reveal>
          <div className="rounded-18 border border-border bg-surface shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-border p-4 md:p-6 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-amber-50 text-warning">
                  <BellRing size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-main-text">Linimasa Peringatan</h2>
                  <p className="text-xs text-secondary-text">
                    {ackedCount} dari {fleetAlerts.length} ditangani
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {SEVERITY_FILTERS.map((f) => {
                  const active = severity === f
                  return (
                    <button
                      key={f}
                      onClick={() => setSeverity(f)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'border-primary-green/30 bg-soft-mint text-primary-green'
                          : 'border-border bg-surface text-secondary-text hover:text-main-text'
                      }`}
                    >
                      {f === 'All' ? 'Semua' : ALERT_SEVERITY_LABEL[f]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Progress bar */}
            <div className="border-b border-border px-4 py-3 md:px-6">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-main-bg">
                <div
                  className="h-full rounded-full bg-primary-green transition-all duration-500"
                  style={{ width: `${fleetAlerts.length ? (ackedCount / fleetAlerts.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <AlertTimeline alerts={filteredAlerts} acked={acked} onToggle={toggleAlert} />
          </div>
        </Reveal>

        <div className="flex items-start gap-3 rounded-12 border border-border bg-main-bg p-4 text-xs leading-relaxed text-secondary-text">
          <Radio size={16} className="mt-0.5 shrink-0 text-deep-teal" />
          <span>Peringatan bersifat indikatif dan tidak mewakili insiden sebenarnya.</span>
        </div>
      </main>
    </>
  )
}

export default AlertsPage
