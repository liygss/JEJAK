import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'

interface ResultRow {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
  accent?: boolean
}

interface CalculationResultProps {
  eyebrow: string
  value: string
  sublabel?: string
  badge?: string
  rows?: ResultRow[]
}

/**
 * Shared "big result card + tidy breakdown rows" pattern used by the CBAM
 * and Energy Savings calculators. Purely presentational.
 */
const CalculationResult = ({ eyebrow, value, sublabel, badge, rows }: CalculationResultProps) => {
  const reduce = useReducedMotion()

  return (
    <div className="overflow-hidden rounded-18 border border-primary-green/20 bg-gradient-to-br from-soft-mint/60 to-surface shadow-sm ring-1 ring-primary-green/10">
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-green">{eyebrow}</p>
          {badge && (
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-primary-green shadow-sm">
              {badge}
            </span>
          )}
        </div>
        <motion.p
          key={value}
          initial={reduce ? undefined : { opacity: 0, y: 6 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-1.5 text-3xl font-extrabold tabular-nums text-primary-green md:text-4xl"
        >
          {value}
        </motion.p>
        {sublabel && <p className="mt-1 text-xs text-secondary-text">{sublabel}</p>}
      </div>

      {rows && rows.length > 0 && (
        <div className="divide-y divide-primary-green/10 border-t border-primary-green/15">
          {rows.map((row) => {
            const Icon = row.icon
            return (
              <div key={row.label} className="flex items-center justify-between gap-3 px-5 py-3 md:px-6">
                <span className="flex items-center gap-2 text-xs text-secondary-text">
                  {Icon && (
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-8 ${
                        row.accent ? 'bg-soft-mint text-primary-green' : 'bg-white/70 text-secondary-text'
                      }`}
                    >
                      <Icon size={13} />
                    </span>
                  )}
                  <span>
                    {row.label}
                    {row.hint && <span className="ml-1.5 text-secondary-text/70">{row.hint}</span>}
                  </span>
                </span>
                <span
                  className={`whitespace-nowrap text-sm font-bold tabular-nums ${
                    row.accent ? 'text-primary-green' : 'text-main-text'
                  }`}
                >
                  {row.value}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CalculationResult
