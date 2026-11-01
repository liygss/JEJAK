import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import Tooltip from '../ui/Tooltip'
import AnimatedNumber from '../ui/AnimatedNumber'
import Sparkline from './Sparkline'

interface KpiCardProps {
  title: string
  value: string
  numericValue?: number
  format?: (n: number) => string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  lowerIsBetter?: boolean
  sparkline?: number[]
  sparkColor?: string
  subtitle?: string
  tooltip?: string
  accent?: boolean
}

const KpiCard = ({
  title,
  value,
  numericValue,
  format,
  icon: Icon,
  trend,
  lowerIsBetter = false,
  sparkline,
  sparkColor = '#059669',
  subtitle,
  tooltip,
  accent,
}: KpiCardProps) => {
  const reduce = useReducedMotion()
  const isUp = trend ? trend.value > 0 : false
  const TrendIcon = isUp ? TrendingUp : TrendingDown
  // When lower is better, a decrease is a good outcome.
  const isGood = trend ? (lowerIsBetter ? trend.value <= 0 : trend.value >= 0) : true

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -4, transition: { duration: 0.2 } }}
      className="flex h-full flex-col rounded-18 border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md md:p-5"
    >
      <div className="flex flex-1 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1">
            <p className="line-clamp-2 text-xs leading-snug text-secondary-text">{title}</p>
            {tooltip && (
              <Tooltip content={tooltip}>
                <Info size={12} className="cursor-help shrink-0 text-secondary-text/60" />
              </Tooltip>
            )}
          </div>
          <h3 className="mt-0.5 text-xl font-bold tabular-nums text-main-text md:text-2xl">
            {numericValue !== undefined ? <AnimatedNumber value={numericValue} format={format} /> : value}
          </h3>
          <div className="mt-auto pt-2">
            {trend ? (
              <div className="flex flex-wrap items-center gap-1">
                <div
                  className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    isGood ? 'bg-soft-mint text-primary-green' : 'bg-red-50 text-danger'
                  }`}
                >
                  <TrendIcon size={12} />
                  {Math.abs(trend.value).toFixed(1)}%
                </div>
                <span className="text-[11px] text-secondary-text">{trend.label}</span>
              </div>
            ) : (
              subtitle && <p className="text-[11px] text-secondary-text">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-12 ${
              accent ? 'bg-soft-mint text-primary-green' : 'bg-main-bg text-secondary-text'
            }`}
          >
            <Icon size={20} />
          </div>
          {sparkline && sparkline.length > 1 && (
            <Sparkline data={sparkline} stroke={sparkColor} fill={`${sparkColor}1f`} width={64} height={26} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default KpiCard
