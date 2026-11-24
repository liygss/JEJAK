import type { CarbonRecord, EnergyRecord, PlantOption } from '../data/types'
import { type CbamCommodity, EUR_TO_IDR, cbamSectors } from '../data/cbam'
import { calculateTotalCarbon } from './calculations'

export type CbamProductRow = {
  process: string
  aggregatedGood: string
  cnCode: number
  productName: string
  seeDirect: number
  seeIndirect: number
  seeTotal: number
  unit: string
  shareDefault: number
  electricityEfSource: string
  embeddedElectricity: number
  reducingAgent: string
}

export type CbamCoverageRow = {
  area: string
  status: string
  source: string
}

export type CbamExportData = {
  generatedAt: string
  generatedAtISO: string
  plant: PlantOption
  periodLabel: string
  reportingPeriod: string
  periodStart: Date
  periodEnd: Date
  installationId: string
  sectorCoverage: readonly string[]
  commodity: CbamCommodity
  tonnes: number
  intensity: number
  embeddedEmissions: number
  certificatePriceEur: number
  carbonPricePaidEur: number
  costEur: number
  costIDR: number
  perTonneIDR: number
  perTonneCo2IDR: number
  formula: { label: string; value: string }[]
  energyMWh: number
  energyTJ: number
  directEmissions: number
  indirectEmissions: number
  totalEmissions: number
  monitoredEmissions: number
  recordedCount: number
  estimatedCount: number
  dataQuality: string
  monitoringMethodology: string
  verifier: string
  declarantStatus: string
  defaultValuesNote: string
  carbonPriceNote: string
  sourceBreakdown: {
    source: string
    energyMWh: number
    activityT: number
    directTCO2e: number
  }[]
  products: CbamProductRow[]
  checklist: { label: string; description: string; done: boolean }[]
  coverage: CbamCoverageRow[]
  completion: number
}

const GAS_NCV_GJ_PER_T = 48
const GAS_EF_TCO2_PER_TJ = 56.1

export function buildCbamExportData(
  plant: PlantOption,
  periodLabel: string,
  commodity: CbamCommodity,
  tonnes: number,
  intensity: number,
  energyRecords: EnergyRecord[],
  carbonRecords: CarbonRecord[],
  checklistState: Record<string, boolean>,
  checklistItems: { id: string; label: string; description: string }[]
): CbamExportData {
  const energyFiltered = energyRecords.filter((r) => r.plant === plant)
  const carbonFiltered = carbonRecords.filter((r) => r.plant === plant)

  const energyMWh = energyFiltered.reduce((s, r) => s + r.consumptionMWh, 0)
  const energyTJ = energyMWh * 0.0036
  const directEmissions = energyTJ * GAS_EF_TCO2_PER_TJ
  const monitoredEmissions = calculateTotalCarbon(carbonFiltered)
  const indirectEmissions = carbonFiltered
    .filter((r) => r.scope === 'Scope 2')
    .reduce((s, r) => s + r.emissionsTCO2e, 0)
  const recordedCount = carbonFiltered.filter((r) => r.dataStatus === 'Recorded').length
  const estimatedCount = carbonFiltered.filter((r) => r.dataStatus === 'Estimated').length

  const areaMap = new Map<string, number>()
  energyFiltered.forEach((r) => {
    areaMap.set(r.area, (areaMap.get(r.area) || 0) + r.consumptionMWh)
  })

  const sourceBreakdown = Array.from(areaMap.entries()).map(([source, mwh]) => {
    const tj = mwh * 0.0036
    const activityT = (tj * 1000) / GAS_NCV_GJ_PER_T
    const directTCO2e = tj * GAS_EF_TCO2_PER_TJ
    return {
      source: `${source} (Combustion)`,
      energyMWh: mwh,
      activityT,
      directTCO2e,
    }
  })

  const totalEmissions = monitoredEmissions
  const costEur = commodity.ratePerTonneEur * tonnes
  const costIDR = costEur * EUR_TO_IDR
  const perTonneIDR = commodity.ratePerTonneEur * EUR_TO_IDR
  const embeddedEmissions = intensity * tonnes
  const perTonneCo2IDR = embeddedEmissions > 0 ? costIDR / embeddedEmissions : 0

  const now = new Date()
  const periodDaysMap: Record<string, number> = {
    'Last 7 Days': 7,
    'Last 30 Days': 30,
    'Last 90 Days': 90,
  }
  const referenceTimestamps = [...energyFiltered, ...carbonFiltered]
    .map((r) => r.timestamp)
    .sort()
  const reference = referenceTimestamps.length > 0 ? referenceTimestamps[referenceTimestamps.length - 1] : undefined
  const periodEnd = reference ? new Date(reference) : now
  const periodStart = new Date(periodEnd)
  periodStart.setDate(periodStart.getDate() - (periodDaysMap[periodLabel] ?? 30))
  const reportingPeriod = `${periodEnd.getFullYear()} — Q${Math.floor(periodEnd.getMonth() / 3) + 1} (data contoh)`

  const checklist = checklistItems.map((i) => ({
    label: i.label,
    description: i.description,
    done: !!checklistState[i.id],
  }))
  const completed = checklist.filter((i) => i.done).length
  const completion = checklist.length > 0 ? Math.round((completed / checklist.length) * 100) : 0

  const seeDirect = tonnes > 0 ? directEmissions / tonnes : 0
  const seeIndirect = tonnes > 0 ? indirectEmissions / tonnes : 0
  const products: CbamProductRow[] = [
    {
      process: 'P1',
      aggregatedGood: commodity.goodsCategory,
      cnCode: commodity.cnCode,
      productName: `${commodity.name} (contoh JEJAK)`,
      seeDirect,
      seeIndirect,
      seeTotal: seeDirect + seeIndirect,
      unit: 'tCO₂e/t',
      shareDefault: 0,
      electricityEfSource: 'Faktor emisi contoh JEJAK',
      embeddedElectricity: tonnes > 0 ? energyMWh / tonnes : 0,
      reducingAgent: commodity.reducingAgent,
    },
  ]

  const coverage: CbamCoverageRow[] = [
    { area: 'A_InstData — data instalasi & periode', status: 'Diisi sebagian', source: 'Pabrik dan periode terpilih' },
    { area: 'B_EmInst — aliran sumber emisi', status: 'Diisi', source: 'Catatan energi JEJAK' },
    { area: 'C_Emissions&Energy — emisi & energi', status: 'Diisi sebagian', source: 'Catatan energi & karbon' },
    { area: 'D_Processes — proses produksi', status: 'Diisi sebagian', source: 'Simulasi komoditas' },
    { area: 'E_PurchPrec — prekursor dibeli', status: 'Belum diisi', source: 'Tidak ada data prekursor' },
    { area: 'Summary_Products — ringkasan produk', status: 'Diisi sebagian', source: 'SEE model JEJAK' },
    { area: 'Summary_Communication — komunikasi deklaran', status: 'Ringkasan di sheet JEJAK', source: 'Dokumen ini' },
  ]

  const carbonPricePaidEur = 0
  const declarantStatus = checklistState['declarant']
    ? 'Dikonfirmasi (ilustratif)'
    : 'Belum dikonfirmasi'
  const dataQuality = carbonFiltered.length > 0
    ? `${recordedCount} tercatat • ${estimatedCount} estimasi dari ${carbonFiltered.length} catatan`
    : 'Tidak ada catatan karbon pada periode ini'

  return {
    generatedAt: now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    generatedAtISO: now.toISOString(),
    plant,
    periodLabel,
    reportingPeriod,
    periodStart,
    periodEnd,
    installationId: `JEJAK-${plant === 'Manufacturing Plant A' ? 'A' : 'B'}-001`,
    sectorCoverage: cbamSectors,
    commodity,
    tonnes,
    intensity,
    embeddedEmissions,
    certificatePriceEur: commodity.ratePerTonneEur,
    carbonPricePaidEur,
    costEur,
    costIDR,
    perTonneIDR,
    perTonneCo2IDR,
    formula: [
      { label: 'Model JEJAK', value: `${tonnes.toLocaleString('id-ID')} t × €${commodity.ratePerTonneEur}/t = €${costEur.toLocaleString('id-ID')}` },
      { label: 'Emisi tersemat', value: `${intensity.toFixed(2)} tCO₂e/t × ${tonnes.toLocaleString('id-ID')} t = ${embeddedEmissions.toLocaleString('id-ID', { maximumFractionDigits: 0 })} tCO₂e` },
      { label: 'Pajak karbon di asal', value: `€${carbonPricePaidEur} (belum ada bukti, ilustratif)` },
      { label: 'Konsep resmi', value: 'Emisi tersemat × harga sertifikat − pajak karbon dibayar, disesuaikan alokasi gratis' },
    ],
    energyMWh,
    energyTJ,
    directEmissions,
    indirectEmissions,
    totalEmissions,
    monitoredEmissions,
    recordedCount,
    estimatedCount,
    dataQuality,
    monitoringMethodology: 'Pembacaan IoT JEJAK + faktor emisi contoh; bukan metodologi terverifikasi',
    verifier: 'Belum diverifikasi — diperlukan verifier terakreditasi',
    declarantStatus,
    defaultValuesNote: 'Aktivitas berdasarkan data aktual JEJAK; default value resmi UE belum diterapkan.',
    carbonPriceNote: 'Belum ada bukti pajak karbon yang dibayar di negara asal; tidak ada pengurangan diterapkan.',
    sourceBreakdown,
    products,
    checklist,
    coverage,
    completion,
  }
}
