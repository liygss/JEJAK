import type { CarbonRecord, EnergyRecord, Insight } from './types'
import {
  calculateTotalCarbon,
  calculateTotalCost,
  calculateTotalEnergy,
  getEfficiencyScore,
  getPeakDay,
} from '../lib/calculations'
import { formatCurrencyIDR, formatMWh, formatTCO2e } from '../lib/formatters'

export type ReportSlug = 'energy' | 'carbon' | 'operational'

export type ReportTemplate = {
  slug: ReportSlug
  name: string
  type: string
  description: string
}

export const reportTemplates: ReportTemplate[] = [
  {
    slug: 'energy',
    name: 'Laporan Konsumsi Energi',
    type: 'Energi',
    description: 'Konsumsi, biaya, dan performa baseline di seluruh area terpantau.',
  },
  {
    slug: 'carbon',
    name: 'Laporan Emisi Karbon',
    type: 'Karbon',
    description: 'Emisi Scope 1 dan Scope 2, intensitas, dan emisi per sumber.',
  },
  {
    slug: 'operational',
    name: 'Ringkasan Operasional',
    type: 'Ringkasan Operasional',
    description: 'Status wawasan, komposisi keparahan, dan estimasi peluang penghematan.',
  },
]

export function getTemplate(slug: string | undefined): ReportTemplate | undefined {
  return reportTemplates.find((t) => t.slug === slug)
}

export type SummaryMetric = { label: string; value: string; hint?: string }

export function buildSummary(
  slug: ReportSlug,
  energy: EnergyRecord[],
  carbon: CarbonRecord[],
  insights: Insight[]
): SummaryMetric[] {
  if (slug === 'energy') {
    const peak = getPeakDay(energy)
    return [
      { label: 'Total Energi', value: formatMWh(calculateTotalEnergy(energy)), hint: 'Periode dipilih' },
      { label: 'Biaya Energi', value: formatCurrencyIDR(calculateTotalCost(energy)), hint: 'Tarif' },
      { label: 'Skor Efisiensi', value: `${getEfficiencyScore(energy)}%`, hint: 'Pembacaan dalam baseline' },
      {
        label: 'Hari Puncak',
        value: peak ? formatMWh(peak.consumptionMWh) : '—',
        hint: peak?.date ?? 'Tidak ada data',
      },
    ]
  }
  if (slug === 'carbon') {
    const scope1 = carbon.filter((r) => r.scope === 'Scope 1').reduce((s, r) => s + r.emissionsTCO2e, 0)
    const scope2 = carbon.filter((r) => r.scope === 'Scope 2').reduce((s, r) => s + r.emissionsTCO2e, 0)
    const days = new Set(carbon.map((r) => r.timestamp)).size || 1
    return [
      { label: 'Total Emisi', value: formatTCO2e(calculateTotalCarbon(carbon)), hint: 'Periode dipilih' },
      { label: 'Scope 1', value: formatTCO2e(scope1), hint: 'Emisi langsung' },
      { label: 'Scope 2', value: formatTCO2e(scope2), hint: 'Energi yang dibeli' },
      { label: 'Intensitas', value: `${(calculateTotalCarbon(carbon) / days).toFixed(2)} tCO₂e/hari`, hint: 'Rata-rata harian' },
    ]
  }
  const high = insights.filter((i) => i.severity === 'High').length
  const reviewed = insights.filter((i) => i.status === 'Reviewed').length
  const savings = insights.reduce((s, i) => s + (i.estimatedSavingsIDR ?? 0), 0)
  return [
    { label: 'Total Wawasan', value: `${insights.length}`, hint: 'Berbasis aturan' },
    { label: 'Keparahan Tinggi', value: `${high}`, hint: 'Perlu perhatian' },
    { label: 'Ditinjau', value: `${reviewed}`, hint: 'Ditandai ditinjau' },
    { label: 'Estimasi Penghematan', value: formatCurrencyIDR(savings), hint: 'Hanya indikatif' },
  ]
}

export type ReportTable = { columns: string[]; rows: (string | number)[][] }

export function buildTable(
  slug: ReportSlug,
  energy: EnergyRecord[],
  carbon: CarbonRecord[],
  insights: Insight[]
): ReportTable {
  if (slug === 'energy') {
    return {
      columns: ['Waktu', 'Area', 'Konsumsi', 'Baseline', 'Status', 'Sumber'],
      rows: energy.map((r) => [
        r.timestamp,
        r.area,
        `${r.consumptionMWh.toFixed(2)} MWh`,
        `${r.baselineMWh.toFixed(2)} MWh`,
        r.consumptionMWh > r.baselineMWh ? 'Di Atas Baseline' : 'Dalam Rentang',
        r.source,
      ]),
    }
  }
  if (slug === 'carbon') {
    return {
      columns: ['Waktu', 'Sumber', 'Scope', 'Emisi', 'Status Data'],
      rows: carbon.map((r) => [
        r.timestamp,
        r.source,
        r.scope,
        `${r.emissionsTCO2e.toFixed(2)} tCO₂e`,
        r.dataStatus,
      ]),
    }
  }
  return {
    columns: ['ID', 'Wawasan', 'Keparahan', 'Area', 'Est. Penghematan', 'Status'],
    rows: insights.map((i) => [
      i.id,
      i.title,
      i.severity,
      i.area,
      i.estimatedSavingsIDR != null ? formatCurrencyIDR(i.estimatedSavingsIDR) : '—',
      i.status,
    ]),
  }
}

export function buildCsv(
  slug: ReportSlug,
  plant: string,
  period: string,
  energy: EnergyRecord[],
  carbon: CarbonRecord[],
  insights: Insight[]
): (string | number)[][] {
  const template = getTemplate(slug)
  const table = buildTable(slug, energy, carbon, insights)
  return [
    ['Laporan JEJAK'],
    ['Nama', template?.name ?? ''],
    ['Tipe', template?.type ?? ''],
    ['Pabrik', plant],
    ['Periode', period],
    ['Dibuat', new Date().toISOString()],
    ['Catatan', 'Angka informasi. Bukan untuk penggunaan regulasi.'],
    [],
    table.columns,
    ...table.rows,
  ]
}
