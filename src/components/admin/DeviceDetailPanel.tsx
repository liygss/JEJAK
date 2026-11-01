import { Gauge, Wifi, Activity, Radio, Cpu, Battery } from 'lucide-react'
import type { FleetDevice } from '../../data/admin'
import { STATUS_CONFIG, QUALITY_COLOR } from '../../pages/admin/adminStyles'
import { FLEET_STATUS_LABEL, DATA_QUALITY_LABEL, locationLabel } from '../../lib/id'
import { getDeviceVisual } from '../../pages/admin/deviceVisuals'
import DeviceTypeIcon from './DeviceTypeIcon'
import Sparkline from '../dashboard/Sparkline'

const Metric = ({
  icon: Icon,
  label,
  value,
  tone = 'text-main-text',
}: {
  icon: typeof Gauge
  label: string
  value: string
  tone?: string
}) => (
  <div className="rounded-12 border border-border bg-surface p-3">
    <div className="flex items-center gap-1.5 text-[11px] text-secondary-text">
      <Icon size={13} />
      {label}
    </div>
    <p className={`mt-1 text-lg font-bold tabular-nums ${tone}`}>{value}</p>
  </div>
)

/** Expanded detail for a device row in the admin Devices table. Simulated. */
const DeviceDetailPanel = ({ device }: { device: FleetDevice }) => {
  const cfg = STATUS_CONFIG[device.status]
  const StatusIcon = cfg.icon
  const visual = getDeviceVisual(device.type)
  const lowBattery = device.batteryPct != null && device.batteryPct < 25

  return (
    <div className="grid grid-cols-1 gap-4 rounded-12 border border-border bg-main-bg/60 p-4 lg:grid-cols-3">
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <DeviceTypeIcon type={device.type} size={16} />
          <div>
            <p className="text-sm font-semibold text-main-text">{device.name}</p>
            <p className="text-xs text-secondary-text">{visual.label} • {locationLabel(device.location)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
            <StatusIcon size={13} /> {FLEET_STATUS_LABEL[device.status]}
          </span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${QUALITY_COLOR[device.dataQuality]}`}>
            Data {DATA_QUALITY_LABEL[device.dataQuality]}
          </span>
        </div>
        <dl className="space-y-1.5 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-secondary-text">ID Perangkat</dt>
            <dd className="font-medium tabular-nums text-main-text">{device.id}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-secondary-text">Firmware</dt>
            <dd className="font-medium text-main-text">{device.firmware}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-secondary-text">Lokasi</dt>
            <dd className="font-medium text-main-text">{locationLabel(device.location)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-secondary-text">Terakhir terlihat</dt>
            <dd className="font-medium tabular-nums text-main-text">{device.lastSeen}</dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-4">
        <Metric icon={Gauge} label="Ketersediaan" value={`${device.uptimePct}%`} />
        <Metric
          icon={Wifi}
          label="Sinyal"
          value={`${device.signalPct}%`}
          tone={device.signalPct < 50 ? 'text-warning' : 'text-main-text'}
        />
        <Metric
          icon={Activity}
          label="Latensi"
          value={`${device.latencyMs} ms`}
          tone={device.latencyMs > 150 ? 'text-warning' : 'text-main-text'}
        />
        <Metric
          icon={Radio}
          label="Kehilangan paket"
          value={`${device.packetLossPct}%`}
          tone={device.packetLossPct > 3 ? 'text-danger' : 'text-main-text'}
        />
        <div className="col-span-2 rounded-12 border border-border bg-surface p-3 lg:col-span-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-secondary-text">
              <Cpu size={13} /> Ketersediaan · 7 hari terakhir
            </span>
            <span className="text-[11px] tabular-nums text-secondary-text">{device.readingsPerHour}/h</span>
          </div>
          <div className="mt-2">
            <Sparkline data={device.uptimeSpark} width={260} height={42} stroke="#0F766E" fill="rgba(15,118,110,0.12)" />
          </div>
        </div>
        <Metric
          icon={Battery}
          label="Baterai"
          value={device.batteryPct == null ? 'Kabel' : `${device.batteryPct}%`}
          tone={lowBattery ? 'text-danger' : 'text-main-text'}
        />
      </div>
    </div>
  )
}

export default DeviceDetailPanel
