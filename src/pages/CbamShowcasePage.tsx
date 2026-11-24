import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Globe,
  Leaf,
  ShieldCheck,
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import Reveal from '../components/ui/Reveal'
import { buildCbamExportData } from '../lib/cbamData'
import { cbamCommodities, cbamSectors, readinessChecklist } from '../data/cbam'
import { carbonRecords } from '../data/carbon'
import { energyRecords } from '../data/energy'
import { formatCurrencyIDRCompact } from '../lib/formatters'
import { usePageMeta } from '../lib/usePageMeta'

const sample = buildCbamExportData(
  'Manufacturing Plant A',
  'Last 30 Days',
  cbamCommodities[0],
  1000,
  1.9,
  energyRecords,
  carbonRecords,
  { declarant: true, mrv: true, records: true },
  readinessChecklist
)

const reportPages = [
  {
    title: 'Halaman 1 — Ringkasan & Perhitungan',
    icon: Calculator,
    items: [
      'Estimasi eksposur biaya tahunan dalam EUR dan IDR',
      'Rincian model: volume, tarif ilustratif, emisi tersemat',
      'Konsep perhitungan resmi CBAM dan pajak karbon di asal',
      'Metrik utama: energi, emisi, biaya per tCO₂e',
    ],
  },
  {
    title: 'Halaman 2 — Metodologi & Kesiapan',
    icon: ShieldCheck,
    items: [
      'Identitas instalasi dan status deklaran',
      'Metodologi pemantauan dan kualitas data',
      'Nilai default UE, penjelasan verifikasi, dan verifier',
      'Daftar periksa kesiapan beserta tingkat penyelesaian',
    ],
  },
  {
    title: 'Halaman 3 — Lampiran Emisi & Produk',
    icon: FileText,
    items: [
      'Aliran sumber emisi selaras B_EmInst',
      'Ringkasan produk, kode CN, dan SEE langsung/tak langsung',
      'Peta kelengkapan sheet template resmi UE',
      'Pernyataan batas penggunaan dan disclaimer',
    ],
  },
]

const CbamShowcasePage = () => {
  usePageMeta(
    'Contoh Laporan CBAM — JEJAK',
    'Lihat contoh laporan komunikasi dan kepatuhan CBAM JEJAK: ringkasan biaya, metodologi, lampiran emisi, dan peta kelengkapan template UE.'
  )
  return (
    <div className="min-h-screen bg-main-bg font-dmsans text-main-text">
      <header className="border-b border-border bg-surface">
        <div className="container mx-auto flex max-w-screen-xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo size="md" showTagline />
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden rounded-12 border border-border px-3 py-2 text-sm font-medium text-secondary-text transition-colors hover:bg-main-bg sm:inline-flex"
            >
              Beranda
            </Link>
            <Link
              to="/dashboard/cbam"
              className="inline-flex items-center gap-2 rounded-12 bg-primary-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-deep-teal"
            >
              Buat Laporan <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-screen-xl space-y-8 px-4 py-10 sm:px-6 md:py-14">
        <Reveal>
          <div className="rounded-18 border border-border bg-gradient-to-br from-soft-mint/70 via-surface to-surface p-6 shadow-sm md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-green/10 px-3 py-1 text-xs font-semibold text-primary-green">
                <Globe size={13} /> CBAM • Fase definitif 2026
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-warning">
                Contoh ilustratif
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-main-text md:text-4xl">
              Contoh Laporan Komunikasi &amp; Kepatuhan CBAM
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-secondary-text md:text-base">
              JEJAK menyusun data energi dan emisi menjadi laporan tiga halaman yang mengikuti struktur
              Communication Template for Installations (EU CBAM V2). Seluruh angka di bawah adalah data contoh
              dan bukan angka resmi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/dashboard/cbam"
                className="inline-flex items-center gap-2 rounded-12 bg-primary-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-deep-teal"
              >
                Coba Buat Laporan <ArrowRight size={16} />
              </Link>
              <Link
                to="/dashboard/reports"
                className="inline-flex items-center gap-2 rounded-12 border border-primary-green/30 bg-soft-mint/60 px-5 py-2.5 text-sm font-medium text-primary-green transition-colors hover:bg-soft-mint"
              >
                Lihat Laporan Lainnya
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Estimasi eksposur', value: formatCurrencyIDRCompact(sample.costIDR), icon: Calculator },
            { label: 'Emisi terpantau', value: `${sample.monitoredEmissions.toFixed(1)} tCO₂e`, icon: Leaf },
            { label: 'Kesiapan checklist', value: `${sample.completion}%`, icon: ShieldCheck },
            { label: 'Format ekspor', value: 'PDF + Excel UE', icon: FileSpreadsheet },
          ].map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="rounded-18 border border-border bg-surface p-5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
                  <Icon size={18} />
                </div>
                <p className="mt-4 text-xs text-secondary-text">{card.label}</p>
                <p className="mt-1 text-xl font-semibold text-main-text">{card.value}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {reportPages.map((page) => {
            const Icon = page.icon
            return (
              <div key={page.title} className="rounded-18 border border-border bg-surface p-5 shadow-sm md:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-10 bg-soft-mint text-primary-green">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-base font-semibold text-main-text">{page.title}</h2>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {page.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-secondary-text">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary-green" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-18 border border-border bg-surface p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-main-text">Yang dibutuhkan deklaran CBAM</h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary-text">
              Berdasarkan informasi Komisi Eropa, fase definitif mulai 1 Januari 2026 mewajibkan deklaran berwenang
              mengajukan otorisasi, melaporkan emisi tersemat, serta membeli dan menyerahkan sertifikat CBAM.
            </p>
            <div className="mt-4 space-y-2 text-sm text-secondary-text">
              <p>• Ambang 50 ton barang CBAM untuk permintaan status authorised declarant.</p>
              <p>• Harga sertifikat mengikuti lelang EU ETS (rata-rata kuartal 2026, mingguan sejak 2027).</p>
              <p>• Pajak karbon yang sudah dibayar di asal dapat dikurangkan dengan bukti yang sah.</p>
              <p>• Data instalasi non-EU dapat disampaikan melalui portal O3CI dan diverifikasi.</p>
            </div>
          </div>

          <div className="rounded-18 border border-border bg-surface p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-main-text">Cakupan enam sektor UE</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {cbamSectors.map((sector) => (
                <div key={sector} className="rounded-10 border border-border bg-main-bg px-3 py-2.5 text-sm text-main-text">
                  {sector}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-secondary-text">
              Simulator JEJAK menyediakan komoditas ilustratif untuk beberapa sektor. Sektor lainnya tetap tercantum
              sebagai referensi cakupan dan dapat ditambahkan sesuai kebutuhan demonstrasi.
            </p>
          </div>
        </div>

        <div className="rounded-18 border border-warning/20 bg-amber-50 p-5 text-xs leading-relaxed text-warning md:p-6">
          <span className="font-semibold">Batas penggunaan.</span> Seluruh tarif, kurs, emisi, kode CN, dan status
          kesiapan pada halaman ini adalah nilai ilustratif untuk demonstrasi. JEJAK bukan layanan resmi Komisi Eropa,
          bukan dokumen hukum, dan bukan nasihat pajak atau kepatuhan. Konfirmasikan kewajiban Anda dengan otoritas
          berwenang dan penasihat berlisensi.
        </div>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="container mx-auto flex max-w-screen-xl flex-col gap-3 px-4 py-6 text-xs text-secondary-text sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© 2026 JEJAK — Contoh laporan CBAM untuk keperluan demonstrasi.</span>
          <Link to="/dashboard/cbam" className="inline-flex items-center gap-1 font-medium text-primary-green">
            Buka simulator CBAM <ArrowRight size={13} />
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default CbamShowcasePage
