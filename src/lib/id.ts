/**
 * Kamus label Bahasa Indonesia terpusat.
 *
 * PENTING: Nilai enum (mis. 'High', 'Online', 'Scope 1') tetap dipakai sebagai
 * kunci LOGIKA di seluruh aplikasi (perbandingan filter/status). Modul ini hanya
 * menyediakan LABEL TAMPILAN Bahasa Indonesia untuk nilai-nilai tersebut, sehingga
 * penerjemahan tidak merusak logika.
 */
import type { AlertSeverity, DeviceStatus, DataQuality, DeviceType } from '../data/admin'
import type { PlantOption, PeriodOption } from './FiltersContext'

type LabelMap<K extends string> = Record<K, string>

/** Nama tanaman (plant) — label tampilan. */
export const PLANT_LABEL: LabelMap<PlantOption> = {
  'Manufacturing Plant A': 'Pabrik Manufaktur A',
  'Manufacturing Plant B': 'Pabrik Manufaktur B',
}

/** Periode pemantauan — label tampilan. */
export const PERIOD_LABEL: LabelMap<PeriodOption> = {
  'Last 7 Days': '7 Hari Terakhir',
  'Last 30 Days': '30 Hari Terakhir',
  'Last 90 Days': '90 Hari Terakhir',
}

export const PLANT_OPTIONS: PlantOption[] = ['Manufacturing Plant A', 'Manufacturing Plant B']
export const PERIOD_OPTIONS: PeriodOption[] = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days']

/** Tingkat keparahan (severity) insight & alert. */
export const SEVERITY_LABEL: Record<'Low' | 'Medium' | 'High', string> = {
  Low: 'Rendah',
  Medium: 'Sedang',
  High: 'Tinggi',
}

/** Status insight. */
export const INSIGHT_STATUS_LABEL: Record<'New' | 'Reviewed', string> = {
  New: 'Baru',
  Reviewed: 'Ditinjau',
}

/** Sumber data energy. */
export const ENERGY_SOURCE_LABEL: Record<'IoT Simulation' | 'Manual Entry', string> = {
  'IoT Simulation': 'IoT',
  'Manual Entry': 'Input Manual',
}

/** Status data carbon. */
export const CARBON_STATUS_LABEL: Record<'Estimated' | 'Recorded', string> = {
  Estimated: 'Estimasi',
  Recorded: 'Tercatat',
}

/** Scope emisi. */
export const SCOPE_LABEL: Record<'Scope 1' | 'Scope 2', string> = {
  'Scope 1': 'Scope 1',
  'Scope 2': 'Scope 2',
}

/** Status device dashboard. */
export const DEVICE_STATUS_LABEL: Record<'Online' | 'Warning' | 'Offline', string> = {
  Online: 'Aktif',
  Warning: 'Peringatan',
  Offline: 'Mati',
}

/** Status device fleet admin. */
export const FLEET_STATUS_LABEL: LabelMap<DeviceStatus> = {
  Online: 'Aktif',
  Warning: 'Peringatan',
  Offline: 'Mati',
  Maintenance: 'Perawatan',
}

/** Kualitas data device. */
export const DATA_QUALITY_LABEL: LabelMap<DataQuality> = {
  Good: 'Baik',
  Degraded: 'Menurun',
  Missing: 'Hilang',
}

/** Tipe device. */
export const DEVICE_TYPE_LABEL: LabelMap<DeviceType> = {
  Meter: 'Meteran',
  Sensor: 'Sensor',
  Gateway: 'Gateway',
  HVAC: 'HVAC',
  PLC: 'PLC',
}

/** Tingkat keparahan alert fleet. */
export const ALERT_SEVERITY_LABEL: LabelMap<AlertSeverity> = {
  High: 'Tinggi',
  Medium: 'Sedang',
  Low: 'Rendah',
}

/** Kategori alert. */
export const ALERT_CATEGORY_LABEL: Record<
  'Connectivity' | 'Power' | 'Maintenance' | 'Data',
  string
> = {
  Connectivity: 'Konektivitas',
  Power: 'Daya',
  Maintenance: 'Perawatan',
  Data: 'Data',
}

/** Prioritas papan perawatan. */
export const PRIORITY_LABEL: Record<'Critical' | 'Scheduled' | 'Monitor', string> = {
  Critical: 'Kritis',
  Scheduled: 'Terjadwal',
  Monitor: 'Pantau',
}

/** Area produksi (energy/carbon). */
export const AREA_LABEL: Record<string, string> = {
  'Production Line': 'Lini Produksi',
  HVAC: 'HVAC',
  Lighting: 'Pencahayaan',
  Utilities: 'Utilitas',
}

export function areaLabel(area: string): string {
  return AREA_LABEL[area] ?? area
}

/** Nama lokasi perangkat fleet admin. */
export const LOCATION_LABEL: Record<string, string> = {
  'Main Substation': 'Gardu Utama',
  'Production Line': 'Lini Produksi',
  'HVAC Room': 'Ruang HVAC',
  'Utility Area': 'Area Utilitas',
  Packaging: 'Pengemasan',
  Warehouse: 'Gudang',
}

export function locationLabel(location: string): string {
  return LOCATION_LABEL[location] ?? location
}

/** Kata umum. */
export const T = {
  simulated: 'Estimasi',
  demoData: 'Data',
  demo: 'Estimasi',
  liveDemo: 'Langsung',
  simulatedOnly: 'Data terpantau',
  demoEnvironment: 'Lingkungan',
  total: 'Total',
  reset: 'Atur ulang',
  search: 'Cari',
  noData: 'Tidak ada data',
} as const

/** Label status kesiapan CBAM. */
export const READINESS_LABEL: Record<'Ready' | 'In progress' | 'Not ready', string> = {
  Ready: 'Siap',
  'In progress': 'Dalam proses',
  'Not ready': 'Belum siap',
}

/** Label umum status laporan. */
export const REPORT_STATUS_LABEL: Record<string, string> = {
  Ready: 'Siap',
}
