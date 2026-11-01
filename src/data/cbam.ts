/**
 * CBAM (Carbon Border Adjustment Mechanism) reference configuration.
 *
 * IMPORTANT: These figures are illustrative reference values for a simulated
 * reference values. They are NOT official CBAM rates, and this page does not constitute
 * legal, tax or compliance advice. Always confirm current rates and rules with
 * the European Commission and a qualified advisor.
 */

/** Reference FX rate used only to display euro figures in IDR. */
export const EUR_TO_IDR = 17000

export type CbamCommodity = {
  id: string
  name: string
  /** Illustrative cost per tonne (EUR), used as a reference. */
  ratePerTonneEur: number
  /** Default annual volume in tonnes for the simulator. */
  defaultTonnes: number
  /** Default embedded emissions intensity (tCO2e per tonne). */
  defaultEmbeddedIntensity: number
  note: string
  goodsCategory: string
  cnCode: number
  productionRoute: string
  reducingAgent: string
}

export const cbamCommodities: CbamCommodity[] = [
  {
    id: 'steel',
    name: 'Baja',
    ratePerTonneEur: 140,
    defaultTonnes: 1000,
    defaultEmbeddedIntensity: 1.9,
    note: 'Referensi ilustratif yang dipakai di seluruh halaman CBAM.',
    goodsCategory: 'Iron or steel products',
    cnCode: 72051000,
    productionRoute: 'All production routes',
    reducingAgent: 'Coal or coke',
  },
  {
    id: 'cement',
    name: 'Semen',
    ratePerTonneEur: 42,
    defaultTonnes: 1000,
    defaultEmbeddedIntensity: 0.6,
    note: 'Referensi ilustratif yang dipakai di seluruh halaman CBAM.',
    goodsCategory: 'Cement',
    cnCode: 25232100,
    productionRoute: 'All production routes',
    reducingAgent: 'n.a.',
  },
  {
    id: 'aluminium',
    name: 'Aluminium primer',
    ratePerTonneEur: 840,
    defaultTonnes: 1000,
    defaultEmbeddedIntensity: 8.6,
    note: 'Referensi ilustratif yang dipakai di seluruh halaman CBAM.',
    goodsCategory: 'Aluminium products',
    cnCode: 76031000,
    productionRoute: 'All production routes',
    reducingAgent: 'n.a.',
  },
]

export function getCommodity(id: string): CbamCommodity {
  return cbamCommodities.find((c) => c.id === id) ?? cbamCommodities[0]
}

/**
 * Estimated CBAM cost in EUR for a volume of a commodity.
 * Simplified formula: rate per tonne × tonnes.
 */
export function estimateCbamCostEur(ratePerTonneEur: number, tonnes: number): number {
  return ratePerTonneEur * tonnes
}

export type ReadinessItem = {
  id: string
  label: string
  description: string
}

export const readinessChecklist: ReadinessItem[] = [
  {
    id: 'declarant',
    label: 'Status Declarant CBAM Resmi',
    description: 'Konfirmasi apakah Anda (atau importir UE Anda) memiliki status declarant resmi.',
  },
  {
    id: 'mrv',
    label: 'Sistem MRV tersedia',
    description: 'Proses pemantauan, pelaporan, dan verifikasi untuk emisi tersemat.',
  },
  {
    id: 'records',
    label: 'Catatan emisi transparan',
    description: 'Catatan energi dan emisi yang akurat dan dapat ditelusuri per lini produksi.',
  },
  {
    id: 'reporting',
    label: 'Jadwal pelaporan terdefinisi',
    description: 'Jadwal yang jelas untuk menyusun dan mengirimkan data emisi.',
  },
]

export const CBAM_DISCLAIMER =
  'Hanya ilustratif. Tarif, kurs, dan estimasi adalah nilai referensi dan bukan angka CBAM resmi. Ini bukan nasihat hukum, pajak, atau kepatuhan.'
