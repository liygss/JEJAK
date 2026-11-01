import { AlertTriangle, CheckCircle, Wrench, WifiOff } from 'lucide-react'
import type { AlertSeverity, DataQuality, DeviceStatus } from '../../data/admin'

export const STATUS_CONFIG: Record<
  DeviceStatus,
  { icon: typeof CheckCircle; color: string; bg: string; dot: string }
> = {
  Online: { icon: CheckCircle, color: 'text-primary-green', bg: 'bg-soft-mint', dot: 'bg-primary-green' },
  Warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-amber-50', dot: 'bg-warning' },
  Offline: { icon: WifiOff, color: 'text-danger', bg: 'bg-red-50', dot: 'bg-danger' },
  Maintenance: { icon: Wrench, color: 'text-deep-teal', bg: 'bg-teal-50', dot: 'bg-deep-teal' },
}

export const QUALITY_COLOR: Record<DataQuality, string> = {
  Good: 'text-primary-green bg-soft-mint',
  Degraded: 'text-warning bg-amber-50',
  Missing: 'text-danger bg-red-50',
}

export const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  High: 'text-danger bg-red-50 border-danger/20',
  Medium: 'text-warning bg-amber-50 border-warning/20',
  Low: 'text-deep-teal bg-teal-50 border-deep-teal/20',
}

export type Priority = 'Critical' | 'Scheduled' | 'Monitor'

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bg: string; border: string; dot: string; accent: string }
> = {
  Critical: {
    label: 'Critical',
    color: 'text-danger',
    bg: 'bg-red-50',
    border: 'border-danger/25',
    dot: 'bg-danger',
    accent: 'bg-danger',
  },
  Scheduled: {
    label: 'Scheduled',
    color: 'text-deep-teal',
    bg: 'bg-teal-50',
    border: 'border-deep-teal/25',
    dot: 'bg-deep-teal',
    accent: 'bg-deep-teal',
  },
  Monitor: {
    label: 'Monitor',
    color: 'text-warning',
    bg: 'bg-amber-50',
    border: 'border-warning/25',
    dot: 'bg-warning',
    accent: 'bg-warning',
  },
}
