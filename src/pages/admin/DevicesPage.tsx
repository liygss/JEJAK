import { Fragment, useMemo, useState } from 'react'
import { Search, Signal, BatteryLow, BatteryFull, Inbox, Radio, ChevronDown, LayoutGrid } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import { useAdminSidebar } from '../../components/layout/AdminLayout'
import { Reveal } from '../../components/ui/Reveal'
import { useToast } from '../../components/ui/Toast'
import Sparkline from '../../components/dashboard/Sparkline'
import DeviceDetailPanel from '../../components/admin/DeviceDetailPanel'
import DeviceTypeIcon from '../../components/admin/DeviceTypeIcon'
import { fleetDevices, type DeviceStatus } from '../../data/admin'
import { FLEET_STATUS_LABEL, DEVICE_TYPE_LABEL, DATA_QUALITY_LABEL, locationLabel } from '../../lib/id'
import { STATUS_CONFIG, QUALITY_COLOR } from './adminStyles'

type Filter = 'All' | DeviceStatus
type SortKey = 'name' | 'uptimePct' | 'signalPct'

const FILTERS: Filter[] = ['All', 'Online', 'Warning', 'Offline', 'Maintenance']

const DevicesPage = () => {
  const { openSidebar } = useAdminSidebar()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Filter>('All')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [expanded, setExpanded] = useState<string | null>(null)

  const counts = useMemo(() => {
    const base: Record<Filter, number> = { All: fleetDevices.length, Online: 0, Warning: 0, Offline: 0, Maintenance: 0 }
    fleetDevices.forEach((d) => (base[d.status] += 1))
    return base
  }, [])

  const filteredDevices = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = fleetDevices.filter((d) => {
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter
      const matchesSearch =
        q === '' ||
        d.name.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
    return [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name)
      return b[sortKey] - a[sortKey]
    })
  }, [search, statusFilter, sortKey])

  const toggleRow = (id: string, name: string) => {
    setExpanded((prev) => (prev === id ? null : id))
    if (expanded !== id)     toast({ title: 'Detail perangkat dibuka', description: `${name}`, variant: 'info' })
  }

  return (
    <>
      <AppHeader
        title="Perangkat"
        subtitle="Armada perangkat AIoT"
        role="admin"
        onMenuClick={openSidebar}
      />
      <main className="space-y-6 p-4 md:p-6">
        <Reveal>
          <div className="rounded-18 border border-border bg-surface shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-border p-4 md:p-6 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-teal-50 text-deep-teal">
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-main-text">Armada Perangkat</h2>
                  <p className="mt-0.5 text-xs text-secondary-text">
                    Perangkat • {filteredDevices.length} ditampilkan dari {fleetDevices.length}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type="text"
                    placeholder="Cari perangkat..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-12 border border-border py-2 pl-9 pr-3 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20 sm:w-52"
                  />
                </div>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="rounded-12 border border-border px-3 py-2 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
                >
                  <option value="name">Urutkan: Nama</option>
                  <option value="uptimePct">Urutkan: Ketersediaan</option>
                  <option value="signalPct">Urutkan: Sinyal</option>
                </select>
              </div>
            </div>

            {/* Status filter chips */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 md:px-6">
              {FILTERS.map((f) => {
                const active = statusFilter === f
                return (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'border-primary-green/30 bg-soft-mint text-primary-green'
                        : 'border-border bg-surface text-secondary-text hover:text-main-text'
                    }`}
                  >
                    {f === 'All' ? 'Semua' : FLEET_STATUS_LABEL[f]}
                    <span className={`rounded-full px-1.5 text-[10px] tabular-nums ${active ? 'bg-white/70' : 'bg-main-bg'}`}>
                      {counts[f]}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border bg-main-bg">
                    <th className="w-10 px-4 py-3" />
                    {['Perangkat', 'Status', 'Sinyal', 'Baterai', 'Ketersediaan (7 hari)', 'Kualitas', 'Terakhir Terlihat'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-text"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDevices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16">
                        <div className="flex flex-col items-center text-center">
                          <Inbox size={28} className="text-secondary-text/50" />
                          <p className="mt-3 text-sm text-secondary-text">Tidak ada perangkat yang cocok dengan filter Anda.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDevices.map((d) => {
                      const cfg = STATUS_CONFIG[d.status]
                      const StatusIcon = cfg.icon
                      const lowBattery = d.batteryPct != null && d.batteryPct < 25
                      const isOpen = expanded === d.id
                      return (
                        <Fragment key={d.id}>
                          <tr
                            className={`cursor-pointer transition-colors ${isOpen ? 'bg-main-bg/70' : 'hover:bg-main-bg/50'}`}
                            onClick={() => toggleRow(d.id, d.name)}
                          >
                            <td className="px-4 py-3">
                              <ChevronDown
                                size={16}
                                className={`text-secondary-text transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <DeviceTypeIcon type={d.type} size={15} />
                                <div>
                                  <p className="text-sm font-medium text-main-text">{d.name}</p>
                                  <p className="text-xs text-secondary-text">
                                    {DEVICE_TYPE_LABEL[d.type]} • {locationLabel(d.location)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}
                              >
                                <StatusIcon size={13} /> {FLEET_STATUS_LABEL[d.status]}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Signal
                                  size={14}
                                  className={d.signalPct < 50 ? 'text-warning' : 'text-secondary-text'}
                                />
                                <span className="text-sm tabular-nums text-main-text">{d.signalPct}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {d.batteryPct == null ? (
                                <span className="text-xs text-secondary-text">Kabel</span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {lowBattery ? (
                                    <BatteryLow size={14} className="text-danger" />
                                  ) : (
                                    <BatteryFull size={14} className="text-secondary-text" />
                                  )}
                                  <span
                                    className={`text-sm tabular-nums ${
                                      lowBattery ? 'font-semibold text-danger' : 'text-main-text'
                                    }`}
                                  >
                                    {d.batteryPct}%
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm tabular-nums text-main-text">{d.uptimePct}%</span>
                                <Sparkline
                                  data={d.uptimeSpark}
                                  width={64}
                                  height={22}
                                  stroke={d.uptimePct < 95 ? '#D97706' : '#059669'}
                                  fill={d.uptimePct < 95 ? 'rgba(217,119,6,0.12)' : 'rgba(5,150,105,0.12)'}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${QUALITY_COLOR[d.dataQuality]}`}
                              >
                                {DATA_QUALITY_LABEL[d.dataQuality]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm tabular-nums text-secondary-text">
                              {d.lastSeen} · {d.firmware}
                            </td>
                          </tr>
                          {isOpen && (
                            <tr>
                              <td colSpan={8} className="bg-main-bg/40 px-4 py-4">
                                <DeviceDetailPanel device={d} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        <div className="flex items-start gap-3 rounded-12 border border-border bg-main-bg p-4 text-xs leading-relaxed text-secondary-text">
          <Radio size={16} className="mt-0.5 shrink-0 text-deep-teal" />
          <span>Daftar perangkat untuk keperluan pemantauan dan perawatan.</span>
        </div>
      </main>
    </>
  )
}

export default DevicesPage
