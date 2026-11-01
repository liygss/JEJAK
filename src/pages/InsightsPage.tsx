import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Sparkles,
  MessageSquare,
  Inbox,
  Send,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Bot,
  User,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import { useSidebar } from '../components/layout/DashboardLayout'
import Drawer from '../components/ui/Drawer'
import { useToast } from '../components/ui/Toast'
import { Stagger, StaggerItem } from '../components/ui/Reveal'
import { insights as initialInsights } from '../data/insights'
import type { Insight } from '../data/types'
import { formatCurrencyIDR } from '../lib/formatters'
import { SEVERITY_LABEL, INSIGHT_STATUS_LABEL, areaLabel } from '../lib/id'

const severityConfig: Record<
  Insight['severity'],
  { icon: typeof AlertCircle; badge: string; bar: string; tile: string }
> = {
  High: { icon: AlertCircle, badge: 'bg-danger/10 text-danger', bar: 'bg-danger', tile: 'bg-red-50 text-danger' },
  Medium: { icon: AlertTriangle, badge: 'bg-warning/10 text-warning', bar: 'bg-warning', tile: 'bg-amber-50 text-warning' },
  Low: { icon: Info, badge: 'bg-teal-50 text-deep-teal', bar: 'bg-deep-teal', tile: 'bg-teal-50 text-deep-teal' },
}

const mockQuestions = [
  'Area produksi mana yang menggunakan energi paling banyak?',
  'Apa saja peluang penghematan energi potensial utama?',
  'Bagaimana emisi karbon berubah bulan ini?',
]

const answers: Record<string, string> = {
  'Area produksi mana yang menggunakan energi paling banyak?':
    'Lini Produksi memiliki total konsumsi energi tertinggi di antara area yang dipantau, dan memiliki pembacaan di atas baseline.',
  'Apa saja peluang penghematan energi potensial utama?':
    'Peluang utama antara lain meninjau jadwal Lini Produksi saat periode menganggur, dan mengoptimalkan jam operasi HVAC pada jendela produksi rendah.',
  'Bagaimana emisi karbon berubah bulan ini?':
    'Intensitas emisi karbon menunjukkan peningkatan moderat selama periode yang dipilih, didorong oleh penggunaan energi yang lebih tinggi di area Lini Produksi.',
}

type ChatMessage = { id: number; role: 'user' | 'assistant'; text: string }

let chatId = 0

const InsightsPage = () => {
  const { openSidebar } = useSidebar()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [insights, setInsights] = useState<Insight[]>(initialInsights)
  const [selectedSeverity, setSelectedSeverity] = useState('All')
  const [selectedArea, setSelectedArea] = useState('All')
  const [selected, setSelected] = useState<Insight | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: ++chatId,
      role: 'assistant',
      text: 'Halo, saya asisten JEJAK. Tanyakan tentang kinerja energi atau karbon, atau pilih saran di bawah ini.',
    },
  ])
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const areas = Array.from(new Set(insights.map((i) => i.area)))
  const severities = ['All', 'High', 'Medium', 'Low']

  const filteredInsights = insights.filter((i) => {
    const matchesSeverity = selectedSeverity === 'All' || i.severity === selectedSeverity
    const matchesArea = selectedArea === 'All' || i.area === selectedArea
    return matchesSeverity && matchesArea
  })

  const totalImpact = insights.reduce((s, i) => s + (i.estimatedSavingsIDR ?? 0), 0)
  const countBy = (sev: Insight['severity']) => insights.filter((i) => i.severity === sev).length
  const openCount = insights.filter((i) => i.status === 'New').length

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  const markReviewed = (id: string) => {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'Reviewed' } : i)))
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: 'Reviewed' } : prev))
    toast({ title: 'Wawasan ditandai sebagai ditinjau', variant: 'success' })
  }

  const ask = (raw: string) => {
    const question = raw.trim()
    if (!question || thinking) return
    setInput('')
    setMessages((prev) => [...prev, { id: ++chatId, role: 'user', text: question }])
    setThinking(true)

    const found = answers[question]
    const reply =
      found ??
      'Asisten JEJAK: tidak ada jawaban yang telah ditetapkan untuk pertanyaan tersebut. Coba salah satu prompt yang disarankan, atau periksa daftar Wawasan untuk detail tingkat area.'

    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: ++chatId, role: 'assistant', text: reply }])
      setThinking(false)
    }, 650)
  }

  return (
    <>
      <AppHeader title="Wawasan AI" subtitle="Jelajahi rekomendasi operasional dan tanyakan JEJAK" onMenuClick={openSidebar} />
      <main className="space-y-6 p-4 md:p-6">
        {/* Summary strip */}
        <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StaggerItem>
            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-secondary-text">
                <Sparkles size={14} className="text-primary-green" /> Wawasan Terbuka
              </div>
              <p className="mt-1 text-2xl font-extrabold text-main-text">{openCount}</p>
              <p className="text-[11px] text-secondary-text">{insights.length} total periode ini</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-secondary-text">
                  <AlertCircle size={14} className="text-danger" /> Keparahan tinggi
                </span>
                <span className="text-lg font-bold text-danger">{countBy('High')}</span>
              </div>
              <div className="mt-2 flex gap-1">
                {['High', 'Medium', 'Low'].map((s) => (
                  <span
                    key={s}
                    className={`h-1.5 flex-1 rounded-full ${
                      s === 'High' ? 'bg-danger' : s === 'Medium' ? 'bg-warning' : 'bg-deep-teal'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-secondary-text">
                Sedang {countBy('Medium')} • Rendah {countBy('Low')}
              </p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-secondary-text">
                <TrendingUp size={14} className="text-primary-green" /> Est. Penghematan
              </div>
              <p className="mt-1 text-xl font-extrabold text-main-text">{formatCurrencyIDR(totalImpact)}</p>
              <p className="text-[11px] text-secondary-text">Peluang indikatif</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="rounded-18 border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-secondary-text">
                <CheckCircle size={14} className="text-primary-green" /> Ditinjau
              </div>
              <p className="mt-1 text-2xl font-extrabold text-main-text">
                {insights.length - openCount}/{insights.length}
              </p>
              <p className="text-[11px] text-secondary-text">Ditandai sebagai ditinjau</p>
            </div>
          </StaggerItem>
        </Stagger>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Insights list */}
          <div className="rounded-18 border border-border bg-surface shadow-sm">
            <div className="border-b border-border p-4 md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-12 bg-soft-mint text-primary-green">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-main-text">Wawasan Operasional</h3>
                  <p className="text-xs text-secondary-text">Rekomendasi berbasis aturan</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  className="rounded-12 border border-border px-3 py-2 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                >
                  {severities.map((s) => (
                    <option key={s} value={s}>
                      {s === 'All' ? 'Semua' : SEVERITY_LABEL[s as 'High' | 'Medium' | 'Low']}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-12 border border-border px-3 py-2 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <option value="All">Semua Area</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {areaLabel(area)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-4 p-4 md:p-6">
              {filteredInsights.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Inbox size={28} className="text-secondary-text/50" />
                  <p className="mt-3 text-sm text-secondary-text">Tidak ada wawasan yang cocok dengan filter Anda.</p>
                </div>
              ) : (
                <AnimatePresence initial={false} mode="popLayout">
                  {filteredInsights.map((insight, i) => {
                    const config = severityConfig[insight.severity]
                    const Icon = config.icon
                    return (
                      <motion.div
                        key={insight.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative overflow-hidden rounded-12 border border-border bg-surface p-4 pl-5 transition-shadow hover:shadow-md"
                      >
                        <span className={`absolute inset-y-0 left-0 w-1 ${config.bar}`} />
                        <div className="flex items-start gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-10 ${config.tile}`}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-main-text">{insight.title}</h4>
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${config.badge}`}>
                                {SEVERITY_LABEL[insight.severity]}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  insight.status === 'Reviewed'
                                    ? 'bg-soft-mint text-primary-green'
                                    : 'bg-main-bg text-secondary-text'
                                }`}
                              >
                                {INSIGHT_STATUS_LABEL[insight.status]}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-secondary-text">{insight.description}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-secondary-text">
                              <span className="rounded-full bg-main-bg px-2 py-0.5">Area: {areaLabel(insight.area)}</span>
                              {insight.estimatedSavingsIDR != null && (
                                <span className="font-medium text-primary-green">
                                  Est. dampak: {formatCurrencyIDR(insight.estimatedSavingsIDR)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 pl-12">
                          <button
                            onClick={() => setSelected(insight)}
                            className="inline-flex items-center gap-1 rounded-10 border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-secondary-text transition-colors hover:bg-main-bg hover:text-main-text"
                          >
                            Lihat Detail <ArrowRight size={13} />
                          </button>
                          {insight.status === 'New' && (
                            <button
                              onClick={() => markReviewed(insight.id)}
                              className="rounded-10 bg-primary-green px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-deep-teal"
                            >
                              Tandai Ditinjau
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Ask JEJAK chat */}
          <div className="flex h-[calc(100vh-8rem)] flex-col rounded-18 border border-border bg-surface shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center gap-2 border-b border-border p-4 md:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-12 bg-soft-mint text-primary-green">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-main-text">Tanya JEJAK</h3>
                <p className="text-xs text-secondary-text">Asisten JEJAK • Respons berbasis aturan</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
              {messages.map((m) => (
                <div key={m.id} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'assistant' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft-mint text-primary-green">
                      <Bot size={15} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-12 px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-primary-green text-white'
                        : 'border border-border bg-main-bg text-main-text'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-deep-teal text-white">
                      <User size={15} />
                    </div>
                  )}
                </div>
              ))}
              {thinking && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft-mint text-primary-green">
                    <Bot size={15} />
                  </div>
                  <div className="flex items-center gap-1 rounded-12 border border-border bg-main-bg px-4 py-3">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-secondary-text"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border p-4 md:p-5">
              <div className="mb-3 flex flex-wrap gap-2">
                {mockQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="rounded-full border border-border bg-main-bg px-3 py-1.5 text-xs text-secondary-text transition-colors hover:bg-slate-50 hover:text-main-text"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  className="max-h-28 min-h-[44px] flex-1 resize-none rounded-12 border border-border p-2.5 text-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
                  rows={1}
                  placeholder="Tanyakan tentang data energi dan karbon Anda..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      ask(input)
                    }
                  }}
                />
                <button
                  onClick={() => ask(input)}
                  disabled={!input.trim() || thinking}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-12 bg-primary-green text-white transition-colors hover:bg-deep-teal disabled:opacity-50"
                  aria-label="Kirim"
                >
                  <Send size={16} />
                </button>
              </div>
              <button
                onClick={() => navigate('/dashboard/reports/operational')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-green"
              >
                Buat laporan Ringkasan Operasional <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        subtitle={selected ? `Keparahan ${SEVERITY_LABEL[selected.severity]} • ${areaLabel(selected.area)}` : undefined}
      >
        {selected && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-secondary-text">Ringkasan</p>
              <p className="mt-1 text-sm text-main-text">{selected.description}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-secondary-text">Data Pendukung</p>
              <ul className="mt-2 space-y-1.5 text-sm text-secondary-text">
                <li>• Area: {areaLabel(selected.area)}</li>
                <li>• Deteksi: ambang berbasis aturan pada baseline</li>
                {selected.estimatedSavingsIDR != null && (
                  <li>• Estimasi Dampak: {formatCurrencyIDR(selected.estimatedSavingsIDR)}</li>
                )}
                <li>• Status: {INSIGHT_STATUS_LABEL[selected.status]}</li>
              </ul>
            </div>
            <div className="rounded-12 border border-border bg-main-bg p-3 text-sm text-secondary-text">
              <span className="font-medium text-main-text">Tindakan yang disarankan:</span> tinjau jadwal dan penggunaan
              peralatan di {areaLabel(selected.area)} pada periode produksi rendah untuk mengurangi pemborosan potensial.
            </div>
            <div className="rounded-12 border border-warning/20 bg-amber-50 p-3 text-xs text-warning">
              Wawasan ini dihasilkan oleh aturan pada data periode terpilih. Ini bukan keluaran dari model AI produksi.
            </div>
            {selected.status === 'New' && (
              <button
                onClick={() => markReviewed(selected.id)}
                className="w-full rounded-12 bg-primary-green px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-deep-teal"
              >
                Tandai Ditinjau
              </button>
            )}
          </div>
        )}
      </Drawer>
    </>
  )
}

export default InsightsPage
