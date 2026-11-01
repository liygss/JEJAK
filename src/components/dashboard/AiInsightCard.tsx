import { Sparkles, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { Insight } from '../../data/types'
import { formatCurrencyIDR } from '../../lib/formatters'
import { SEVERITY_LABEL, areaLabel } from '../../lib/id'

const severityConfig = {
  High: { icon: AlertCircle, color: 'text-danger', bg: 'bg-red-50', badge: 'bg-danger/10 text-danger' },
  Medium: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-amber-50', badge: 'bg-warning/10 text-warning' },
  Low: { icon: Info, color: 'text-deep-teal', bg: 'bg-teal-50', badge: 'bg-teal-50 text-deep-teal' },
}

interface AiInsightCardProps {
  insights: Insight[]
  onMarkReviewed?: (id: string) => void
}

const AiInsightCard = ({ insights, onMarkReviewed }: AiInsightCardProps) => {
  const newInsights = insights.filter(i => i.status === 'New')

  return (
    <div className="bg-surface rounded-18 border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-12 bg-soft-mint text-primary-green">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-main-text">Wawasan AI JEJAK</h3>
          <p className="text-xs text-secondary-text">Rekomendasi operasional berbasis aturan</p>
        </div>
      </div>
      <div className="space-y-4">
        {newInsights.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-4 text-center text-sm text-secondary-text"
          >
            Semua wawasan telah ditinjau
          </motion.p>
        ) : (
          <AnimatePresence initial={false} mode="popLayout">
            {newInsights.map((insight) => {
              const config = severityConfig[insight.severity]
              const Icon = config.icon
              return (
                <motion.div
                  key={insight.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={`p-4 rounded-12 border border-border ${config.bg}/40`}
                >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-10 mt-0.5 ${config.badge}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-main-text text-sm">{insight.title}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.badge}`}>
                          {SEVERITY_LABEL[insight.severity]}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-text mb-2">{insight.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-text">
                        <span>Area: {areaLabel(insight.area)}</span>
                        {insight.estimatedSavingsIDR && (
                          <span>Est. Penghematan: {formatCurrencyIDR(insight.estimatedSavingsIDR)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 ml-11">
                  <Link
                    to="/dashboard/insights"
                    className="px-2.5 py-1.5 text-xs font-medium rounded-10 bg-surface border border-border text-secondary-text hover:text-main-text hover:bg-main-bg transition-colors"
                  >
                    Lihat Detail
                  </Link>
                  <button
                    onClick={() => onMarkReviewed?.(insight.id)}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-10 bg-primary-green text-white hover:bg-deep-teal transition-colors"
                  >
                    Tandai Ditinjau
                  </button>
                </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default AiInsightCard
