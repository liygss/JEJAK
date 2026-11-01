import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Printer, FileQuestion, FileText, Loader2 } from 'lucide-react'
import AppHeader from '../components/layout/AppHeader'
import { useSidebar } from '../components/layout/DashboardLayout'
import ReportDocument from '../components/reports/ReportDocument'
import { downloadPdf } from '../lib/pdf'
import { useFilters } from '../lib/FiltersContext'
import { useToast } from '../components/ui/Toast'
import { energyRecords } from '../data/energy'
import { carbonRecords } from '../data/carbon'
import { insights } from '../data/insights'
import { buildCsv, getTemplate, type ReportSlug } from '../data/reports'
import { PLANT_LABEL } from '../lib/id'

const validSlugs: ReportSlug[] = ['energy', 'carbon', 'operational']

const ReportDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const { openSidebar } = useSidebar()
  const { filterEnergy, filterCarbon, plant, period } = useFilters()
  const { toast } = useToast()

  const [generating, setGenerating] = useState(false)

  const template = getTemplate(slug)
  const isValid = template && validSlugs.includes(slug as ReportSlug)

  if (!isValid) {
    return (
      <>
        <AppHeader title="Laporan" subtitle="Laporan tidak ditemukan" onMenuClick={openSidebar} />
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md rounded-18 border border-border bg-surface p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-18 bg-main-bg text-secondary-text">
              <FileQuestion size={26} />
            </div>
            <h2 className="text-lg font-semibold text-main-text">Laporan tidak ditemukan</h2>
            <p className="mt-2 text-sm text-secondary-text">Jenis laporan yang diminta tidak tersedia.</p>
            <Link
              to="/dashboard/reports"
              className="mt-5 inline-flex items-center gap-2 rounded-12 bg-primary-green px-4 py-2 text-sm font-medium text-white hover:bg-deep-teal"
            >
              <ArrowLeft size={16} /> Kembali ke Laporan
            </Link>
          </div>
        </main>
      </>
    )
  }

  const reportSlug = slug as ReportSlug
  const energy = filterEnergy(energyRecords)
  const carbon = filterCarbon(carbonRecords)

  const handleDownload = () => {
    const rows = buildCsv(reportSlug, plant, period, energy, carbon, insights)
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `jejak_${reportSlug}_report.csv`
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({ title: 'Laporan diunduh', description: 'Ekspor CSV dimulai.', variant: 'success' })
  }

  const handleGeneratePdf = async () => {
    if (generating) return
    setGenerating(true)
    toast({ title: 'Membuat PDF', description: 'Menyusun laporan Anda…', variant: 'info' })
    try {
      const { default: ReportPdfDocument } = await import('../components/reports/ReportPdfDocument')
      await downloadPdf(
        <ReportPdfDocument
          slug={reportSlug}
          plant={plant}
          period={period}
          energy={energy}
          carbon={carbon}
          insights={insights}
        />,
        `jejak_${reportSlug}_report.pdf`
      )
      toast({ title: 'PDF siap', description: 'Unduhan dimulai.', variant: 'success' })
    } catch {
      toast({ title: 'PDF gagal', description: 'Tidak dapat membuat PDF. Coba tampilan cetak.', variant: 'warning' })
    } finally {
      setGenerating(false)
    }
  }

  const handlePrint = () => {
    toast({ title: 'Menyiapkan tampilan cetak', description: 'Gunakan “Simpan sebagai PDF” di dialog cetak.', variant: 'info' })
    window.setTimeout(() => window.print(), 250)
  }

  return (
    <>
      <div className="no-print">
        <AppHeader title={template!.name} subtitle={`${template!.type} • ${PLANT_LABEL[plant]}`} onMenuClick={openSidebar} />
      </div>
      <main className="space-y-4 p-4 md:p-6">
        <div className="no-print mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link
            to="/dashboard/reports"
            className="inline-flex items-center gap-2 rounded-12 border border-border bg-surface px-3 py-2 text-sm font-medium text-secondary-text transition-colors hover:bg-main-bg hover:text-main-text"
          >
            <ArrowLeft size={16} /> Kembali ke Laporan
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-12 border border-border bg-surface px-3 py-2 text-sm font-medium text-main-text transition-colors hover:bg-main-bg"
            >
              <Download size={16} /> CSV
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-12 border border-border bg-surface px-3 py-2 text-sm font-medium text-main-text transition-colors hover:bg-main-bg"
            >
              <Printer size={16} /> Cetak
            </button>
            <button
              onClick={handleGeneratePdf}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-12 bg-primary-green px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-deep-teal disabled:cursor-not-allowed disabled:opacity-70"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {generating ? 'Membuat…' : 'Buat PDF'}
            </button>
          </div>
        </div>

        <ReportDocument
          slug={reportSlug}
          plant={plant}
          period={period}
          energy={energy}
          carbon={carbon}
          insights={insights}
        />
      </main>
    </>
  )
}

export default ReportDetailPage
