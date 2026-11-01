import { BellRing, CheckCheck, RotateCcw } from 'lucide-react'
import type { FleetAlert } from '../../data/admin'
import { getDeviceName } from '../../data/admin'
import { SEVERITY_COLOR } from '../../pages/admin/adminStyles'
import { ALERT_SEVERITY_LABEL, ALERT_CATEGORY_LABEL } from '../../lib/id'

interface AlertTimelineProps {
  alerts: FleetAlert[]
  acked: Record<string, boolean>
  onToggle: (alert: FleetAlert) => void
}

const DOT_COLOR: Record<FleetAlert['severity'], string> = {
  High: 'bg-danger',
  Medium: 'bg-warning',
  Low: 'bg-deep-teal',
}

/** Vertical timeline of simulated alerts with acknowledge/undo. */
const AlertTimeline = ({ alerts, acked, onToggle }: AlertTimelineProps) => {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <BellRing size={28} className="text-secondary-text/50" />
        <p className="mt-3 text-sm text-secondary-text">Tidak ada peringatan yang cocok dengan filter Anda.</p>
      </div>
    )
  }

  return (
    <ol className="relative space-y-0 px-4 py-2 md:px-6">
      {alerts.map((a, i) => {
        const isAcked = !!acked[a.id]
        const isLast = i === alerts.length - 1
        return (
          <li key={a.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && <span className="absolute left-[5px] top-4 h-full w-px bg-border" aria-hidden />}
            <span
              className={`relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4 ring-surface ${
                isAcked ? 'bg-border' : DOT_COLOR[a.severity]
              }`}
            />
            <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_COLOR[a.severity]}`}>
                    {ALERT_SEVERITY_LABEL[a.severity]}
                  </span>
                  <span className="rounded-full bg-main-bg px-2 py-0.5 text-[10px] font-medium text-secondary-text">
                    {ALERT_CATEGORY_LABEL[a.category]}
                  </span>
                  <span className="text-[11px] tabular-nums text-secondary-text">{a.raisedAt}</span>
                </div>
                <p className={`mt-1.5 text-sm font-semibold ${isAcked ? 'text-secondary-text line-through' : 'text-main-text'}`}>
                  {a.title}
                </p>
                <p className="mt-0.5 text-xs text-secondary-text">{getDeviceName(a.deviceId)}</p>
                <p className="mt-1 text-xs leading-relaxed text-secondary-text">{a.detail}</p>
              </div>
              <button
                onClick={() => onToggle(a)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-10 border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isAcked
                    ? 'border-border bg-main-bg text-secondary-text hover:text-main-text'
                    : 'border-primary-green/30 bg-soft-mint text-primary-green hover:bg-primary-green hover:text-white'
                }`}
              >
                {isAcked ? <RotateCcw size={13} /> : <CheckCheck size={13} />}
                {isAcked ? 'Batalkan' : 'Akui'}
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default AlertTimeline
