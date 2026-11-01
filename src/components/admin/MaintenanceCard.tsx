import { useState } from 'react'
import {
  Gauge,
  Wifi,
  Activity,
  Battery,
  Wrench,
  User,
  Clock,
  Package,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import type { FleetDevice } from '../../data/admin'
import { DATA_QUALITY_LABEL, DEVICE_TYPE_LABEL, FLEET_STATUS_LABEL, locationLabel } from '../../lib/id'
import { getDeviceVisual } from '../../pages/admin/deviceVisuals'
import { STATUS_CONFIG } from '../../pages/admin/adminStyles'
import DeviceSchematic from './DeviceSchematic'
import Sparkline from '../dashboard/Sparkline'
import Drawer from '../ui/Drawer'
import Tooltip from '../ui/Tooltip'

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
  <div className="rounded-10 border border-border bg-main-bg/60 px-2.5 py-2">
    <div className="flex items-center gap-1 text-[10px] text-secondary-text">
      <Icon size={11} />
      {label}
    </div>
    <p className={`mt-0.5 text-sm font-bold tabular-nums ${tone}`}>{value}</p>
  </div>
)

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-main-bg px-2 py-0.5 text-[10px] font-medium text-secondary-text">
    {children}
  </span>
)

interface MaintenanceCardProps {
  device: FleetDevice
  reasons: { label: string; icon: typeof Battery }[]
  done: boolean
  onToggleDone: (d: FleetDevice) => void
}

const MaintenanceCard = ({ device, reasons, done, onToggleDone }: MaintenanceCardProps) => {
  const [open, setOpen] = useState(false)
  const visual = getDeviceVisual(device.type)
  const statusCfg = STATUS_CONFIG[device.status]
  const StatusIcon = statusCfg.icon
  const lowBattery = device.batteryPct != null && device.batteryPct < 25
  const weakSignal = device.signalPct < 50
  const highLatency = device.latencyMs > 150
  const highLoss = device.packetLossPct > 3

  return (
    <>
      <div
        className={`flex flex-col gap-3 rounded-12 border bg-surface p-4 shadow-sm transition-opacity ${
          done ? 'border-border opacity-60' : 'border-border hover:shadow-md'
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-10 border border-border bg-main-bg/50 p-1">
            <DeviceSchematic type={device.type} status={device.status} size={56} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-sm font-semibold ${
                done ? 'text-secondary-text line-through' : 'text-main-text'
              }`}
            >
              {device.name}
            </p>
            <p className="truncate text-xs text-secondary-text">
              {DEVICE_TYPE_LABEL[device.type]} • {locationLabel(device.location)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusCfg.bg} ${statusCfg.color}`}
              >
                <StatusIcon size={11} />
                {FLEET_STATUS_LABEL[device.status]}
              </span>
              <span className="text-[10px] text-secondary-text">#{device.id}</span>
            </div>
          </div>
        </div>

        {/* Reasons */}
        <div className="flex flex-wrap gap-1.5">
          {reasons.map((r) => {
            const Icon = r.icon
            return (
              <span
                key={r.label}
                className="inline-flex items-center gap-1 rounded-full bg-main-bg px-2 py-0.5 text-[10px] font-medium text-secondary-text"
              >
                <Icon size={11} />
                {r.label}
              </span>
            )
          })}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <Metric icon={Gauge} label="Ketersediaan" value={`${device.uptimePct}%`} />
          <Metric
            icon={Wifi}
            label="Sinyal"
            value={`${device.signalPct}%`}
            tone={weakSignal ? 'text-warning' : 'text-main-text'}
          />
          <Metric
            icon={Activity}
            label="Latensi"
            value={`${device.latencyMs} ms`}
            tone={highLatency ? 'text-warning' : 'text-main-text'}
          />
          <Metric
            icon={Battery}
            label="Baterai"
            value={device.batteryPct == null ? 'Kabel' : `${device.batteryPct}%`}
            tone={lowBattery ? 'text-danger' : 'text-main-text'}
          />
        </div>

        {/* Uptime trend */}
        <div className="rounded-10 border border-border bg-main-bg/60 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-secondary-text">Tren 7 hari</span>
            <span className="text-[10px] tabular-nums text-secondary-text">{device.readingsPerHour}/h</span>
          </div>
          <div className="mt-1">
            <Sparkline
              data={device.uptimeSpark}
              width={200}
              height={30}
              stroke={visual.chartColor}
              fill={`${visual.chartColor}1f`}
            />
          </div>
        </div>

        {/* Work order */}
        {device.workOrderId && (
          <div className="rounded-10 border border-border bg-main-bg/60 p-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-text">
                <Wrench size={11} /> Perintah Kerja
              </span>
              <span className="text-[10px] font-semibold tabular-nums text-main-text">{device.workOrderId}</span>
            </div>
            <div className="space-y-1 text-[11px] text-secondary-text">
              {device.technician && (
                <p className="flex items-center gap-1.5">
                  <User size={11} /> {device.technician}
                </p>
              )}
              {device.scheduledFor && (
                <p className="flex items-center gap-1.5">
                  <Clock size={11} /> {device.scheduledFor}
                </p>
              )}
              {device.estimatedMinutes != null && (
                <p className="flex items-center gap-1.5">
                  <Activity size={11} /> Estimasi {device.estimatedMinutes} menit
                </p>
              )}
            </div>
            {device.spareParts && device.spareParts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {device.spareParts.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] text-secondary-text"
                  >
                    <Package size={10} /> {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleDone(device)}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-10 border px-3 py-1.5 text-xs font-medium transition-colors ${
              done
                ? 'border-border bg-main-bg text-secondary-text hover:text-main-text'
                : 'border-primary-green/30 bg-soft-mint text-primary-green hover:bg-primary-green hover:text-white'
            }`}
          >
            {done ? <RotateCcw size={13} /> : <CheckCircle2 size={13} />}
            {done ? 'Buka kembali' : 'Tandai selesai'}
          </button>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 rounded-10 border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-secondary-text transition-colors hover:bg-main-bg hover:text-main-text"
          >
            Detail <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Detail drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={device.name}
        subtitle={`${DEVICE_TYPE_LABEL[device.type]} • ${locationLabel(device.location)}`}
      >
        <div className="space-y-5">
          <div className="flex items-center gap-4 rounded-12 border border-border bg-main-bg/60 p-4">
            <DeviceSchematic type={device.type} status={device.status} size={88} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}
                >
                  <StatusIcon size={12} />
                  {FLEET_STATUS_LABEL[device.status]}
                </span>
                <span className="inline-flex items-center rounded-full bg-main-bg px-2 py-0.5 text-xs font-medium text-secondary-text">
                  Data {DATA_QUALITY_LABEL[device.dataQuality]}
                </span>
              </div>
              <dl className="space-y-1 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary-text">ID Perangkat</dt>
                  <dd className="font-medium tabular-nums text-main-text">{device.id}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary-text">Firmware</dt>
                  <dd className="font-medium text-main-text">{device.firmware}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary-text">Terakhir terlihat</dt>
                  <dd className="font-medium tabular-nums text-main-text">{device.lastSeen}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary-text">Kehilangan paket</dt>
                  <dd className={`font-medium tabular-nums ${highLoss ? 'text-danger' : 'text-main-text'}`}>
                    {device.packetLossPct}%
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric icon={Gauge} label="Ketersediaan" value={`${device.uptimePct}%`} />
            <Metric
              icon={Wifi}
              label="Sinyal"
              value={`${device.signalPct}%`}
              tone={weakSignal ? 'text-warning' : 'text-main-text'}
            />
            <Metric
              icon={Activity}
              label="Latensi"
              value={`${device.latencyMs} ms`}
              tone={highLatency ? 'text-warning' : 'text-main-text'}
            />
            <Metric
              icon={Battery}
              label="Baterai"
              value={device.batteryPct == null ? 'Kabel' : `${device.batteryPct}%`}
              tone={lowBattery ? 'text-danger' : 'text-main-text'}
            />
          </div>

          {device.workOrderId && (
            <div className="rounded-12 border border-border bg-main-bg/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-text">
                  <Wrench size={13} /> Perintah Kerja
                </span>
                <span className="text-sm font-bold tabular-nums text-main-text">{device.workOrderId}</span>
              </div>
              <div className="space-y-2 text-sm">
                {device.technician && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-secondary-text">
                      <User size={13} /> Teknisi
                    </span>
                    <span className="font-medium text-main-text">{device.technician}</span>
                  </div>
                )}
                {device.scheduledFor && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-secondary-text">
                      <Clock size={13} /> Jadwal
                    </span>
                    <span className="font-medium text-main-text">{device.scheduledFor}</span>
                  </div>
                )}
                {device.estimatedMinutes != null && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-secondary-text">
                      <Activity size={13} /> Estimasi durasi
                    </span>
                    <span className="font-medium text-main-text">{device.estimatedMinutes} menit</span>
                  </div>
                )}
              </div>
              {device.spareParts && device.spareParts.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="mb-2 text-xs font-medium text-secondary-text">Suku cadang dibutuhkan</p>
                  <div className="flex flex-wrap gap-1.5">
                    {device.spareParts.map((p) => (
                      <Chip key={p}>
                        <Package size={10} /> {p}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-12 border border-border bg-main-bg/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-secondary-text">Tren ketersediaan 7 hari</span>
              <span className="text-xs tabular-nums text-secondary-text">{device.readingsPerHour} pembacaan/jam</span>
            </div>
            <Sparkline
              data={device.uptimeSpark}
              width={320}
              height={54}
              stroke={visual.chartColor}
              fill={`${visual.chartColor}1f`}
            />
          </div>

          <div className="rounded-12 border border-border bg-main-bg/60 p-4">
            <p className="mb-2 text-xs font-medium text-secondary-text">Temuan</p>
            <ul className="space-y-1.5 text-sm text-secondary-text">
              {reasons.map((r) => {
                const Icon = r.icon
                return (
                  <li key={r.label} className="flex items-center gap-2">
                    <Icon size={13} className="shrink-0 text-warning" />
                    {r.label}
                  </li>
                )
              })}
              <li className="flex items-center gap-2">
                <Activity size={13} className="shrink-0 text-warning" />
                Kualitas data {DATA_QUALITY_LABEL[device.dataQuality].toLowerCase()}
              </li>
            </ul>
          </div>

          <Tooltip content="Status penandaan tersimpan di tampilan lokal selama sesi ini.">
            <button
              onClick={() => {
                onToggleDone(device)
                setOpen(false)
              }}
              className={`inline-flex w-full items-center justify-center gap-1.5 rounded-12 border px-4 py-2.5 text-sm font-medium transition-colors ${
                done
                  ? 'border-border bg-main-bg text-secondary-text hover:text-main-text'
                  : 'border-primary-green/30 bg-soft-mint text-primary-green hover:bg-primary-green hover:text-white'
              }`}
            >
              {done ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}
              {done ? 'Buka kembali perintah kerja' : 'Tandai perintah kerja selesai'}
            </button>
          </Tooltip>
        </div>
      </Drawer>
    </>
  )
}

export default MaintenanceCard
