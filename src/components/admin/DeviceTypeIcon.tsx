import type { DeviceType } from '../../data/admin'
import { getDeviceVisual } from '../../pages/admin/deviceVisuals'

interface DeviceTypeIconProps {
  type: DeviceType
  size?: number
  variant?: 'badge' | 'plain'
  className?: string
}

/** Type-specific device icon — a distinct glyph & colour per AIoT device type. */
const DeviceTypeIcon = ({ type, size = 16, variant = 'badge', className = '' }: DeviceTypeIconProps) => {
  const visual = getDeviceVisual(type)
  const Icon = visual.icon

  if (variant === 'plain') {
    return <Icon size={size} className={`${visual.color} ${className}`} />
  }

  const box = Math.round(size * 2)
  return (
    <div
      className={`flex items-center justify-center rounded-10 ${visual.bg} ${className}`}
      style={{ height: box, width: box }}
    >
      <Icon size={size} className={visual.color} />
    </div>
  )
}

export default DeviceTypeIcon
