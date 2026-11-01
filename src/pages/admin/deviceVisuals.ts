import { Gauge, RadioTower, Router, Wind, CircuitBoard } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DeviceType } from '../../data/admin'

export type DeviceVisual = {
  icon: LucideIcon
  label: string
  color: string
  bg: string
  chartColor: string
}

/** Single source of truth for how each device type is represented visually. */
export const DEVICE_TYPE_VISUAL: Record<DeviceType, DeviceVisual> = {
  Meter: { icon: Gauge, label: 'Meter', color: 'text-deep-teal', bg: 'bg-teal-50', chartColor: '#0F766E' },
  Sensor: { icon: RadioTower, label: 'Sensor', color: 'text-teal-accent', bg: 'bg-teal-50', chartColor: '#14B8A6' },
  Gateway: { icon: Router, label: 'Gateway', color: 'text-primary-green', bg: 'bg-soft-mint', chartColor: '#059669' },
  HVAC: { icon: Wind, label: 'HVAC', color: 'text-warning', bg: 'bg-amber-50', chartColor: '#D97706' },
  PLC: { icon: CircuitBoard, label: 'PLC', color: 'text-secondary-text', bg: 'bg-main-bg', chartColor: '#64748B' },
}

export function getDeviceVisual(type: DeviceType): DeviceVisual {
  return DEVICE_TYPE_VISUAL[type]
}
