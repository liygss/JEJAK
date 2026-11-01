import type { DeviceStatus, DeviceType } from '../../data/admin'
import { getDeviceVisual } from '../../pages/admin/deviceVisuals'

interface DeviceSchematicProps {
  type: DeviceType
  status: DeviceStatus
  size?: number
  className?: string
}

const STATUS_LED: Record<DeviceStatus, string> = {
  Online: '#059669',
  Warning: '#D97706',
  Offline: '#DC2626',
  Maintenance: '#0F766E',
}

/** Ilustrasi bentuk fisik perangkat sesuai tipenya. */
const MeterBody = ({ led }: { led: string }) => (
  <>
    <rect x="14" y="18" width="52" height="64" rx="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="22" y="27" width="36" height="20" rx="3" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
    <path d="M28 40 L33 32 L38 40 L43 32 L48 40" stroke="#059669" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <circle cx="40" cy="59" r="6" fill="none" stroke="#94A3B8" strokeWidth="2" />
    <path d="M40 59 L44 55" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
    <rect x="24" y="70" width="10" height="6" rx="2" fill="#94A3B8" />
    <rect x="46" y="70" width="10" height="6" rx="2" fill="#94A3B8" />
    <circle cx="40" cy="24" r="3" fill={led} />
  </>
)

const SensorBody = ({ led }: { led: string }) => (
  <>
    <rect x="26" y="44" width="28" height="34" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
    <path d="M40 44 L40 24" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="40" cy="20" r="4" fill="#94A3B8" />
    <path d="M30 34 Q40 20 50 34" stroke="#14B8A6" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M24 30 Q40 8 56 30" stroke="#14B8A6" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.35" />
    <circle cx="40" cy="56" r="4" fill={led} />
    <rect x="32" y="64" width="16" height="4" rx="2" fill="#94A3B8" />
  </>
)

const GatewayBody = ({ led }: { led: string }) => (
  <>
    <rect x="12" y="44" width="56" height="32" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
    <path d="M24 44 L24 22" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M56 44 L56 22" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="24" cy="18" r="4" fill="#94A3B8" />
    <circle cx="56" cy="18" r="4" fill="#94A3B8" />
    <rect x="20" y="54" width="14" height="8" rx="2" fill="#059669" opacity="0.25" />
    <rect x="20" y="54" width="14" height="8" rx="2" fill="none" stroke="#059669" strokeWidth="1.2" />
    <circle cx="46" cy="58" r="3" fill={led} />
    <circle cx="56" cy="58" r="3" fill="#CBD5E1" />
  </>
)

const HvacBody = ({ led }: { led: string }) => (
  <>
    <rect x="10" y="28" width="60" height="48" rx="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
    <path d="M18 38 L62 38" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 46 L62 46" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 54 L62 54" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 62 L62 62" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
    <circle cx="26" cy="20" r="8" fill="none" stroke="#D97706" strokeWidth="2" opacity="0.5" />
    <path d="M26 14 L26 8 M18 18 L13 14 M34 18 L39 14" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
    <circle cx="60" cy="20" r="3" fill={led} />
  </>
)

const PlcBody = ({ led }: { led: string }) => (
  <>
    <rect x="14" y="26" width="52" height="52" rx="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="20" y="32" width="40" height="18" rx="2" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
    <circle cx="27" cy="41" r="2.5" fill={led} />
    <circle cx="36" cy="41" r="2.5" fill="#CBD5E1" />
    <circle cx="45" cy="41" r="2.5" fill="#CBD5E1" />
    <circle cx="54" cy="41" r="2.5" fill="#CBD5E1" />
    <rect x="20" y="56" width="7" height="16" rx="1.5" fill="#D97706" opacity="0.4" />
    <rect x="29" y="56" width="7" height="16" rx="1.5" fill="#94A3B8" opacity="0.4" />
    <rect x="38" y="56" width="7" height="16" rx="1.5" fill="#94A3B8" opacity="0.4" />
    <rect x="47" y="56" width="7" height="16" rx="1.5" fill="#059669" opacity="0.4" />
  </>
)

const BODIES: Record<DeviceType, (p: { led: string }) => React.ReactElement> = {
  Meter: MeterBody,
  Sensor: SensorBody,
  Gateway: GatewayBody,
  HVAC: HvacBody,
  PLC: PlcBody,
}

/** Ilustrasi alat sesuai tipe perangkat, lengkap dengan LED status. */
const DeviceSchematic = ({ type, status, size = 88, className = '' }: DeviceSchematicProps) => {
  const visual = getDeviceVisual(type)
  const Body = BODIES[type]
  const led = STATUS_LED[status]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 96"
      className={className}
      role="img"
      aria-label={`Ilustrasi ${visual.label}`}
    >
      <rect width="80" height="96" rx="12" fill={visual.bg} />
      <Body led={led} />
    </svg>
  )
}

export default DeviceSchematic
