import { useMemo } from 'react'
import { CheckCircle, AlertTriangle, WifiOff, Wrench } from 'lucide-react'
import type { DeviceStatus } from '../../data/admin'
import { FLEET_STATUS_LABEL } from '../../lib/id'

type DonutSegment = {
  status: DeviceStatus
  count: number
  color: string
  icon: typeof CheckCircle
  text: string
}

const SEGMENT_META: Record<DeviceStatus, { color: string; icon: typeof CheckCircle; text: string }> = {
  Online: { color: '#059669', icon: CheckCircle, text: 'text-primary-green' },
  Warning: { color: '#D97706', icon: AlertTriangle, text: 'text-warning' },
  Offline: { color: '#DC2626', icon: WifiOff, text: 'text-danger' },
  Maintenance: { color: '#0F766E', icon: Wrench, text: 'text-deep-teal' },
}

interface FleetStatusDonutProps {
  counts: Record<DeviceStatus, number>
  total: number
}

/** SVG donut showing the fleet status split. Purely presentational, simulated. */
const FleetStatusDonut = ({ counts, total }: FleetStatusDonutProps) => {
  const segments = useMemo<DonutSegment[]>(() => {
    return (Object.keys(counts) as DeviceStatus[])
      .map((status) => ({
        status,
        count: counts[status],
        ...SEGMENT_META[status],
      }))
      .filter((s) => s.count > 0)
  }, [counts])

  const online = counts.Online ?? 0
  const healthPct = total > 0 ? Math.round((online / total) * 100) : 0

  const R = 54
  const STROKE = 14
  const C = 2 * Math.PI * R
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-around">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-main-bg)" strokeWidth={STROKE} />
          {segments.map((seg) => {
            const frac = total > 0 ? seg.count / total : 0
            const dash = frac * C
            const circle = (
              <circle
                key={seg.status}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            )
            offset += dash
            return circle
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tabular-nums text-main-text">{healthPct}%</span>
          <span className="text-[11px] font-medium text-secondary-text">aktif</span>
        </div>
      </div>

      <div className="w-full space-y-2">
        {segments.map((seg) => {
          const Icon = seg.icon
          return (
            <div key={seg.status} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-secondary-text">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <Icon size={14} className={seg.text} />
                {FLEET_STATUS_LABEL[seg.status]}
              </span>
              <span className="font-semibold tabular-nums text-main-text">{seg.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FleetStatusDonut
