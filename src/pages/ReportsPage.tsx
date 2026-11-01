import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Download, Eye, Search, Zap, Leaf, Sparkles, Inbox, ArrowRight, FileDown, Loader2 } from 'lucide-react'
import AppHeader from '../components/layout/AppHeader'
import { useSidebar } from '../components/layout/DashboardLayout'
import { useToast } from '../components/ui/Toast'
import { useFilters } from '../lib/FiltersContext'
import { downloadPdf } from '../lib/pdf'
import { energyRecords } from '../data/energy'
import { carbonRecords } from '../data/carbon'
import { insights } from '../data/insights'
import { buildCsv, reportTemplates, type ReportSlug } from '../data/reports'
import { PERIOD_LABEL, REPORT_STATUS_LABEL } from '../lib/id'

const iconFor: Record<ReportSlug, typeof Zap> = {
  energy: Zap,
  carbon: Leaf,
  operational: Sparkles,
}

const tileFor: Record<ReportSlug, string> = {
  energy: 'bg-teal-50 text-teal-accent',
  carbon: 'bg-soft-mint text-primary-green',
  operational: 'bg-teal-50 text-deep-teal',
}

const createdFor: Record<ReportSlug, string> = {
  energy: '2025-10-09',
  carbon: '2025-10-09',
  operational: '2025-10-09',
}

const ReportsPage = () => {
  const { openSidebar } = useSidebar()
  const { plant, period, filterEnergy, filterCarbon } = useFilters()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [pdfSlug, setPdfSlug] = useState<ReportSlug | null>(null)

  const plantEnergy = useMemo(() => filterEnergy(energyRecords), [filterEnergy])
  const plantCarbon = useMemo(() => filterCarbon(carbonRecords), [filterCarbon])
  const recordsFor = useMemo<Record<ReportSlug, number>>(
    () => ({
      energy: plantEnergy.length,
      carbon: plantCarbon.length,
      operational: insights.length,
    }),
    [plantEnergy, plantCarbon]
  )

  const reportRows = useMemo(
    () =>
      reportTemplates.filter((t) => {
        const matchesType = typeFilter === 'All' || t.type === typeFilter
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
        return matchesType && matchesSearch
      }),
    [search, typeFilter]
  )

  const types = ['All', ...reportTemplates.map((t) => t.type)]

  const download = (slug: ReportSlug) => {
    const rows = buildCsv(slug, plant, period, plantEnergy, plantCarbon, insights)
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `jejak_${slug}_report.csv`
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({ title: 'CSV diunduh', description: 'Ekspor CSV dimulai.', variant: 'success' })
  }

  const generatePdf = async (slug: ReportSlug) => {
    if (pdfSlug) return
    setPdfSlug(slug)
    toast({ title: 'Membuat PDF', description: 'Menyusun laporan Anda…', variant: 'info' })
    try {
      const { default: ReportPdfDocument } = await import('../components/reports/ReportPdfDocument')
      await downloadPdf(
        <ReportPdfDocument
          slug={slug}
          plant={plant}
          period={period}
          energy={plantEnergy}
          carbon={plantCarbon}
          insights={insights}
        />,
        `jejak_${slug}_report.pdf`
      )
      toast({ title: 'PDF siap', description: 'Unduhan dimulai.', variant: 'success' })
    } catch {
      toast({ title: 'PDF gagal', description: 'Tidak dapat membuat PDF.', variant: 'warning' })
    } finally {
      setPdfSlug(null)
    }
  }

  return (
    <>
      <AppHeader title="Laporan" subtitle="Buat dan ekspor laporan" onMenuClick={openSidebar} />
      <main className="space-y-6 p-4 md:p-6">
        {/* Templates */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-main-text">Buat laporan</h2>
            <p className="mt-0.5 text-xs text-secondary-text">
              Pilih jenis laporan. Pratinjau menggunakan pabrik dan periode saat ini.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {reportTemplates.map((t, i) => {
              const Icon = iconFor[t.slug]
              return (
                <motion.div
                  key={t.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex flex-col rounded-18 border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-green/30 hover:shadow-md"
                >
                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-12 ${tileFor[t.slug]}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-main-text">{t.name}</h3>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-secondary-text">{t.description}</p>
                  <Link
                    to={`/dashboard/reports/${t.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-green"
                  >
                    Buat <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Library */}
        <section className="rounded-18 border border-border bg-surface shadow-sm">
          <div className="border-b border-border p-4 md:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-lg font-semibold text-main-text">Pustaka Laporan</h3>
                <p className="mt-1 text-xs text-secondary-text">*Laporan mengikuti pabrik dan periode yang dipilih</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type="text"
                    placeholder="Cari laporan..."
                    className="w-full rounded-12 border border-border py-2 pl-9 pr-3 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20 sm:w-52"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="rounded-12 border border-border px-3 py-2 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t === 'All' ? 'Semua Jenis' : t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-border bg-main-bg">
                  {['Laporan', 'Jenis', 'Periode', 'Catatan', 'Dibuat', 'Status', 'Aksi'].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-secondary-text ${
                        h === 'Aksi' ? 'text-right' : h === 'Status' || h === 'Catatan' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reportRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16">
                      <div className="flex flex-col items-center text-center">
                        <Inbox size={28} className="text-secondary-text/50" />
                        <p className="mt-3 text-sm text-secondary-text">Tidak ada laporan yang cocok dengan filter Anda.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reportRows.map((t, i) => {
                    const Icon = iconFor[t.slug]
                    return (
                      <motion.tr
                        key={t.slug}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                        className="transition-colors hover:bg-main-bg/50"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-10 ${tileFor[t.slug]}`}>
                              <Icon size={15} />
                            </div>
                            <span className="text-sm font-medium text-main-text">{t.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-main-text">{t.type}</td>
                        <td className="px-6 py-3 text-sm text-main-text">{PERIOD_LABEL[period]}</td>
                        <td className="px-6 py-3 text-center text-sm text-secondary-text">{recordsFor[t.slug]}</td>
                        <td className="px-6 py-3 text-sm text-main-text">{createdFor[t.slug]}</td>
                        <td className="px-6 py-3 text-center">
                          <span className="inline-flex items-center rounded-full bg-soft-mint px-2 py-0.5 text-xs font-medium text-primary-green">
                            {REPORT_STATUS_LABEL.Ready}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/dashboard/reports/${t.slug}`}
                              className="inline-flex items-center gap-1.5 rounded-10 border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-secondary-text transition-colors hover:bg-main-bg hover:text-main-text"
                            >
                              <Eye size={14} /> Pratinjau
                            </Link>
                            <button
                              onClick={() => download(t.slug)}
                              title="Ekspor CSV"
                              className="inline-flex items-center gap-1.5 rounded-10 border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-secondary-text transition-colors hover:bg-main-bg hover:text-main-text"
                            >
                              <Download size={14} /> CSV
                            </button>
                            <button
                              onClick={() => generatePdf(t.slug)}
                              disabled={!!pdfSlug}
                              className="inline-flex items-center gap-1.5 rounded-10 bg-primary-green px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-deep-teal disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {pdfSlug === t.slug ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <FileDown size={14} />
                              )}
                              {pdfSlug === t.slug ? 'Membuat…' : 'PDF'}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="flex items-center gap-1.5 text-xs text-secondary-text">
          <FileText size={13} /> Laporan mengikuti pabrik dan periode yang dipilih di header.
        </p>
      </main>
    </>
  )
}

export default ReportsPage
