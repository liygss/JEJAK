import { deviceTypeCounts } from '../../data/admin'
import { DEVICE_TYPE_LABEL } from '../../lib/id'
import { getDeviceVisual } from '../../pages/admin/deviceVisuals'

/** Horizontal bar chart of device counts by type. Presentational, simulated. */
const DeviceTypeBar = () => {
  const total = deviceTypeCounts.reduce((s, t) => s + t.count, 0)
  const max = Math.max(...deviceTypeCounts.map((t) => t.count), 1)

  return (
    <div className="space-y-3">
      {deviceTypeCounts.map((t) => {
        const pct = total > 0 ? Math.round((t.count / total) * 100) : 0
        const visual = getDeviceVisual(t.type)
        const Icon = visual.icon
        return (
          <div key={t.type}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-main-text">
                <Icon size={13} className={visual.color} />
                {DEVICE_TYPE_LABEL[t.type]}
              </span>
              <span className="tabular-nums text-secondary-text">
                {t.count} · {pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-main-bg">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(t.count / max) * 100}%`, backgroundColor: visual.chartColor }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DeviceTypeBar
