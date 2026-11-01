/**
 * Admin console reference data — AIoT fleet telemetry.
 *
 * IMPORTANT: Every record here is illustrative reference data. Device states,
 * signal, battery, firmware and alerts are illustrative only and do not
 * represent real hardware or a real security/compliance posture.
 */

export type DeviceType = 'Meter' | 'Sensor' | 'Gateway' | 'HVAC' | 'PLC'
export type DeviceStatus = 'Online' | 'Warning' | 'Offline' | 'Maintenance'
export type DataQuality = 'Good' | 'Degraded' | 'Missing'

export type FleetDevice = {
  id: string
  name: string
  type: DeviceType
  location: string
  status: DeviceStatus
  lastSeen: string
  uptimePct: number
  signalPct: number
  batteryPct: number | null
  firmware: string
  dataQuality: DataQuality
  readingsPerHour: number
  /** Simulated latency in ms for the device's last readings. */
  latencyMs: number
  /** Simulated packet loss (%) over the last window. */
  packetLossPct: number
  /** Uptime for the last 7 days (%), oldest → newest. Simulated. */
  uptimeSpark: number[]
  /** Teknisi lapangan yang ditugaskan untuk perangkat ini. */
  technician?: string
  /** Nomor perintah kerja perawatan. */
  workOrderId?: string
  /** Jadwal kunjungan berikutnya. */
  scheduledFor?: string
  /** Estimasi durasi perbaikan (menit). */
  estimatedMinutes?: number
  /** Suku cadang yang diperkirakan dibutuhkan. */
  spareParts?: string[]
}

export const fleetDevices: FleetDevice[] = [
  {
    id: 'gw-01',
    name: 'Gateway Gardu Utara',
    type: 'Gateway',
    location: 'Main Substation',
    status: 'Online',
    lastSeen: '14:30',
    uptimePct: 99.8,
    signalPct: 92,
    batteryPct: null,
    firmware: 'v3.4.1',
    dataQuality: 'Good',
    readingsPerHour: 60,
    latencyMs: 32,
    packetLossPct: 0.1,
    uptimeSpark: [99.9, 99.8, 99.9, 100, 99.7, 99.9, 99.8],
  },
  {
    id: 'mtr-01',
    name: 'Meteran Energi Utama',
    type: 'Meter',
    location: 'Main Substation',
    status: 'Online',
    lastSeen: '14:30',
    uptimePct: 99.6,
    signalPct: 88,
    batteryPct: null,
    firmware: 'v3.4.1',
    dataQuality: 'Good',
    readingsPerHour: 60,
    latencyMs: 41,
    packetLossPct: 0.2,
    uptimeSpark: [99.8, 99.6, 99.5, 99.7, 99.9, 99.4, 99.6],
  },
  {
    id: 'sen-01',
    name: 'Sensor Lini Produksi',
    type: 'Sensor',
    location: 'Production Line',
    status: 'Online',
    lastSeen: '14:29',
    uptimePct: 98.9,
    signalPct: 81,
    batteryPct: 74,
    firmware: 'v2.9.0',
    dataQuality: 'Good',
    readingsPerHour: 48,
    latencyMs: 58,
    packetLossPct: 0.4,
    uptimeSpark: [99.1, 98.8, 99.0, 98.6, 98.9, 99.2, 98.9],
  },
  {
    id: 'sen-02',
    name: 'Sensor Getaran A',
    type: 'Sensor',
    location: 'Production Line',
    status: 'Warning',
    lastSeen: '14:25',
    uptimePct: 94.2,
    signalPct: 46,
    batteryPct: 18,
    firmware: 'v2.8.3',
    dataQuality: 'Degraded',
    readingsPerHour: 31,
    latencyMs: 186,
    packetLossPct: 4.8,
    uptimeSpark: [97.5, 96.9, 95.8, 95.1, 94.6, 94.2, 93.8],
    technician: 'Rudi Hartono',
    workOrderId: 'WO-2415',
    scheduledFor: 'Hari ini, 15:30',
    estimatedMinutes: 45,
    spareParts: ['Baterai Li-ion 3.7V', 'Bracket sensor'],
  },
  {
    id: 'hvac-01',
    name: 'Meteran HVAC',
    type: 'HVAC',
    location: 'HVAC Room',
    status: 'Warning',
    lastSeen: '14:25',
    uptimePct: 95.1,
    signalPct: 58,
    batteryPct: null,
    firmware: 'v3.2.0',
    dataQuality: 'Degraded',
    readingsPerHour: 42,
    latencyMs: 142,
    packetLossPct: 3.1,
    uptimeSpark: [98.2, 97.7, 97.1, 96.4, 95.9, 95.5, 95.1],
    technician: 'Sinta Wibowo',
    workOrderId: 'WO-2414',
    scheduledFor: 'Besok, 08:30',
    estimatedMinutes: 75,
    spareParts: ['Sensor flow 2 inch', 'Kabel pulsir 3m'],
  },
  {
    id: 'mtr-02',
    name: 'Meteran Utilitas',
    type: 'Meter',
    location: 'Utility Area',
    status: 'Online',
    lastSeen: '14:28',
    uptimePct: 99.1,
    signalPct: 79,
    batteryPct: null,
    firmware: 'v3.4.1',
    dataQuality: 'Good',
    readingsPerHour: 60,
    latencyMs: 47,
    packetLossPct: 0.3,
    uptimeSpark: [99.3, 99.0, 99.2, 98.9, 99.1, 99.0, 99.1],
  },
  {
    id: 'plc-01',
    name: 'PLC Lini Pengemasan',
    type: 'PLC',
    location: 'Packaging',
    status: 'Offline',
    lastSeen: '13:06',
    uptimePct: 88.4,
    signalPct: 0,
    batteryPct: null,
    firmware: 'v1.7.5',
    dataQuality: 'Missing',
    readingsPerHour: 0,
    latencyMs: 0,
    packetLossPct: 100,
    uptimeSpark: [96.2, 95.1, 93.8, 92.0, 90.5, 88.9, 0],
    technician: 'Dimas Pratama',
    workOrderId: 'WO-2413',
    scheduledFor: 'Hari ini, 14:00',
    estimatedMinutes: 180,
    spareParts: ['Modul I/O 16CH', 'Kabel Ethernet RJ45'],
  },
  {
    id: 'sen-03',
    name: 'Sensor Suhu Ruangan',
    type: 'Sensor',
    location: 'Warehouse',
    status: 'Online',
    lastSeen: '14:30',
    uptimePct: 97.3,
    signalPct: 70,
    batteryPct: 63,
    firmware: 'v2.9.0',
    dataQuality: 'Good',
    readingsPerHour: 24,
    latencyMs: 88,
    packetLossPct: 1.1,
    uptimeSpark: [97.9, 97.6, 97.4, 97.1, 97.5, 97.2, 97.3],
  },
  {
    id: 'gw-02',
    name: 'Gateway Sayap Selatan',
    type: 'Gateway',
    location: 'Warehouse',
    status: 'Maintenance',
    lastSeen: '12:40',
    uptimePct: 91.0,
    signalPct: 34,
    batteryPct: null,
    firmware: 'v3.3.6',
    dataQuality: 'Degraded',
    readingsPerHour: 12,
    latencyMs: 224,
    packetLossPct: 6.5,
    uptimeSpark: [95.4, 94.8, 94.1, 93.0, 92.2, 91.5, 91.0],
    technician: 'Dimas Pratama',
    workOrderId: 'WO-2417',
    scheduledFor: 'Hari ini, 15:00',
    estimatedMinutes: 90,
    spareParts: ['Modul radio 2.4GHz', 'Kabel ethernet 5m'],
  },
  {
    id: 'sen-04',
    name: 'Sensor Suhu Oven',
    type: 'Sensor',
    location: 'Production Line',
    status: 'Warning',
    lastSeen: '13:48',
    uptimePct: 93.4,
    signalPct: 38,
    batteryPct: 21,
    firmware: 'v2.8.1',
    dataQuality: 'Degraded',
    readingsPerHour: 28,
    latencyMs: 164,
    packetLossPct: 5.2,
    uptimeSpark: [96.8, 96.1, 95.4, 94.8, 94.2, 93.8, 93.4],
    technician: 'Rudi Hartono',
    workOrderId: 'WO-2418',
    scheduledFor: 'Hari ini, 16:30',
    estimatedMinutes: 45,
    spareParts: ['Baterai Li-ion 3.7V', 'Kabel probe suhu 2m'],
  },
  {
    id: 'sen-05',
    name: 'Sensor Tekanan Pipa',
    type: 'Sensor',
    location: 'Utility Area',
    status: 'Warning',
    lastSeen: '13:15',
    uptimePct: 92.6,
    signalPct: 31,
    batteryPct: 44,
    firmware: 'v2.7.9',
    dataQuality: 'Degraded',
    readingsPerHour: 22,
    latencyMs: 152,
    packetLossPct: 4.1,
    uptimeSpark: [97.2, 96.0, 95.1, 94.3, 93.6, 93.0, 92.6],
    technician: 'Rudi Hartono',
    workOrderId: 'WO-2419',
    scheduledFor: 'Besok, 09:00',
    estimatedMinutes: 60,
    spareParts: ['Sensor tekanan 0-10bar', 'Konektor M12'],
  },
  {
    id: 'mtr-03',
    name: 'Meteran Lini Pengemasan',
    type: 'Meter',
    location: 'Packaging',
    status: 'Warning',
    lastSeen: '13:58',
    uptimePct: 94.8,
    signalPct: 44,
    batteryPct: null,
    firmware: 'v3.1.2',
    dataQuality: 'Degraded',
    readingsPerHour: 48,
    latencyMs: 118,
    packetLossPct: 2.7,
    uptimeSpark: [98.4, 97.6, 96.9, 96.2, 95.7, 95.2, 94.8],
    technician: 'Sinta Wibowo',
    workOrderId: 'WO-2420',
    scheduledFor: 'Besok, 10:30',
    estimatedMinutes: 75,
    spareParts: ['CT ring 200A', 'Klem terminal'],
  },
  {
    id: 'gw-03',
    name: 'Gateway Area Utilitas',
    type: 'Gateway',
    location: 'Utility Area',
    status: 'Maintenance',
    lastSeen: '12:58',
    uptimePct: 90.4,
    signalPct: 41,
    batteryPct: null,
    firmware: 'v2.9.1',
    dataQuality: 'Degraded',
    readingsPerHour: 9,
    latencyMs: 236,
    packetLossPct: 7.3,
    uptimeSpark: [95.1, 94.3, 93.5, 92.4, 91.6, 90.9, 90.4],
    technician: 'Dimas Pratama',
    workOrderId: 'WO-2421',
    scheduledFor: 'Besok, 13:00',
    estimatedMinutes: 120,
    spareParts: ['Firmware v3.4.1', 'Antena eksternal 5dBi'],
  },
  {
    id: 'hvac-02',
    name: 'AHU Roof Blok B',
    type: 'HVAC',
    location: 'HVAC Room',
    status: 'Warning',
    lastSeen: '14:02',
    uptimePct: 94.1,
    signalPct: 62,
    batteryPct: null,
    firmware: 'v3.0.4',
    dataQuality: 'Degraded',
    readingsPerHour: 36,
    latencyMs: 178,
    packetLossPct: 3.4,
    uptimeSpark: [97.9, 97.1, 96.4, 95.8, 95.2, 94.6, 94.1],
    technician: 'Sinta Wibowo',
    workOrderId: 'WO-2422',
    scheduledFor: 'Hari ini, 17:00',
    estimatedMinutes: 100,
    spareParts: ['Filter AHU G4', 'Sensor suhu 10k'],
  },
  {
    id: 'plc-02',
    name: 'PLC Lini Sortir',
    type: 'PLC',
    location: 'Production Line',
    status: 'Offline',
    lastSeen: '12:22',
    uptimePct: 86.2,
    signalPct: 0,
    batteryPct: null,
    firmware: 'v1.6.9',
    dataQuality: 'Missing',
    readingsPerHour: 0,
    latencyMs: 0,
    packetLossPct: 100,
    uptimeSpark: [95.4, 94.1, 92.6, 90.8, 89.1, 87.4, 0],
    technician: 'Dimas Pratama',
    workOrderId: 'WO-2416',
    scheduledFor: 'Hari ini, 14:00',
    estimatedMinutes: 180,
    spareParts: ['Modul I/O 16CH', 'Kabel EthernetRJ45'],
  },
]

/** Telemetry throughput per hour for the last 24h (readings/hour). Simulated. */
export const telemetrySeries: { hour: string; readings: number }[] = Array.from(
  { length: 24 },
  (_, i) => {
    const hour = String(i).padStart(2, '0') + ':00'
    const wave = Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2)
    const base = 210 + wave * 70
    const dip = i === 13 || i === 19 ? 40 : 0
    return { hour, readings: Math.max(40, Math.round(base - dip)) }
  }
)

export type AlertSeverity = 'High' | 'Medium' | 'Low'

export type FleetAlert = {
  id: string
  deviceId: string
  title: string
  detail: string
  severity: AlertSeverity
  category: 'Connectivity' | 'Power' | 'Maintenance' | 'Data'
  raisedAt: string
}

export const fleetAlerts: FleetAlert[] = [
  {
    id: 'al-1',
    deviceId: 'plc-01',
    title: 'Perangkat mati',
    detail: 'PLC Lini Pengemasan berhenti melapor. Tidak ada telemetri selama lebih dari 80 menit.',
    severity: 'High',
    category: 'Connectivity',
    raisedAt: '13:06',
  },
  {
    id: 'al-2',
    deviceId: 'sen-02',
    title: 'Baterai lemah',
    detail: 'Baterai Sensor Getaran A tersisa 18%. Segera ganti baterai.',
    severity: 'Medium',
    category: 'Power',
    raisedAt: '13:52',
  },
  {
    id: 'al-3',
    deviceId: 'sen-02',
    title: 'Sinyal lemah',
    detail: 'Kekuatan sinyal 46%. Pembacaan bisa menjadi tidak stabil.',
    severity: 'Medium',
    category: 'Connectivity',
    raisedAt: '14:02',
  },
  {
    id: 'al-4',
    deviceId: 'hvac-01',
    title: 'Kualitas data menurun',
    detail: 'Meteran HVAC melaporkan pembacaan menurun. Periksa kalibrasi dan kabel.',
    severity: 'Medium',
    category: 'Data',
    raisedAt: '13:40',
  },
  {
    id: 'al-5',
    deviceId: 'gw-02',
    title: 'Perawatan terjadwal',
    detail: 'Gateway Sayap Selatan ditandai untuk pembaruan firmware dan inspeksi.',
    severity: 'Low',
    category: 'Maintenance',
    raisedAt: '12:40',
  },
]

export type FleetSummary = {
  total: number
  online: number
  warning: number
  offline: number
  maintenance: number
  avgUptime: number
  throughputPerHour: number
  openAlerts: number
}

export function getFleetSummary(): FleetSummary {
  const total = fleetDevices.length
  const online = fleetDevices.filter((d) => d.status === 'Online').length
  const warning = fleetDevices.filter((d) => d.status === 'Warning').length
  const offline = fleetDevices.filter((d) => d.status === 'Offline').length
  const maintenance = fleetDevices.filter((d) => d.status === 'Maintenance').length
  const avgUptime = fleetDevices.reduce((s, d) => s + d.uptimePct, 0) / total
  const throughputPerHour = fleetDevices.reduce((s, d) => s + d.readingsPerHour, 0)
  return {
    total,
    online,
    warning,
    offline,
    maintenance,
    avgUptime: Math.round(avgUptime * 10) / 10,
    throughputPerHour,
    openAlerts: fleetAlerts.length,
  }
}

/** Devices that likely need a field visit. Derived, client-side, simulated. */
export function getMaintenanceQueue(): FleetDevice[] {
  return fleetDevices
    .filter(
      (d) =>
        d.status === 'Offline' ||
        d.status === 'Maintenance' ||
        (d.batteryPct != null && d.batteryPct < 25) ||
        d.signalPct < 50 ||
        d.dataQuality !== 'Good'
    )
    .sort((a, b) => {
      const rank: Record<DeviceStatus, number> = { Offline: 0, Warning: 1, Maintenance: 2, Online: 3 }
      return rank[a.status] - rank[b.status]
    })
}

export function getDeviceName(id: string): string {
  return fleetDevices.find((d) => d.id === id)?.name ?? id
}

export function getDeviceById(id: string): FleetDevice | undefined {
  return fleetDevices.find((d) => d.id === id)
}

/** Fleet uptime (%) for the last 30 days, oldest → newest. Simulated. */
export const fleetUptimeSeries: { day: string; uptime: number }[] = Array.from(
  { length: 30 },
  (_, i) => {
    const wave = Math.sin((i / 30) * Math.PI * 2) * 0.5
    const dip = i === 24 ? 2.4 : i === 12 ? 1.1 : 0
    return {
      day: `D${i + 1}`,
      uptime: Math.round((98.6 + wave - dip) * 10) / 10,
    }
  }
)

/** Devices per type for distribution charts. Simulated. */
export const deviceTypeCounts: { type: DeviceType; count: number }[] = (
  ['Meter', 'Sensor', 'Gateway', 'HVAC', 'PLC'] as DeviceType[]
).map((type) => ({
  type,
  count: fleetDevices.filter((d) => d.type === type).length,
}))

/** Average simulated latency across the fleet (ms). */
export function getAvgLatency(): number {
  const active = fleetDevices.filter((d) => d.status !== 'Offline')
  if (active.length === 0) return 0
  const sum = active.reduce((s, d) => s + d.latencyMs, 0)
  return Math.round(sum / active.length)
}

/** Average simulated packet loss across the fleet (%). */
export function getAvgPacketLoss(): number {
  const active = fleetDevices.filter((d) => d.status !== 'Offline')
  if (active.length === 0) return 0
  const sum = active.reduce((s, d) => s + d.packetLossPct, 0)
  return Math.round((sum / active.length) * 10) / 10
}

export type AdminActivity = {
  id: string
  kind: 'reconnect' | 'firmware' | 'alert' | 'reading' | 'schedule'
  title: string
  detail: string
  time: string
}

/** Admin activity feed for the console. */
export const adminActivity: AdminActivity[] = [
  {
    id: 'act-1',
    kind: 'alert',
    title: 'Peringatan keparahan tinggi muncul',
    detail: 'PLC Lini Pengemasan berhenti melapor (Konektivitas).',
    time: '13:06',
  },
  {
    id: 'act-2',
    kind: 'firmware',
    title: 'Pembaruan firmware dijadwalkan',
    detail: 'v3.4.1 diantrekan untuk 3 perangkat gateway semalam.',
    time: '12:52',
  },
  {
    id: 'act-3',
    kind: 'reconnect',
    title: 'Perangkat tersambung kembali',
    detail: 'Sensor Getaran A kembali ke jaringan setelah putus singkat.',
    time: '12:31',
  },
  {
    id: 'act-4',
    kind: 'reading',
    title: 'Batch telemetri diterima',
    detail: '312 pembacaan dinormalisasi dari 8 perangkat.',
    time: '11:58',
  },
  {
    id: 'act-5',
    kind: 'schedule',
    title: 'Jendela perawatan dibuka',
    detail: 'Gateway Sayap Selatan dimasukkan ke mode servis terencana.',
    time: '10:40',
  },
]

export function getAlertCounts() {
  const open = fleetAlerts.length
  const high = fleetAlerts.filter((a) => a.severity === 'High').length
  const medium = fleetAlerts.filter((a) => a.severity === 'Medium').length
  const low = fleetAlerts.filter((a) => a.severity === 'Low').length
  return { open, high, medium, low }
}
