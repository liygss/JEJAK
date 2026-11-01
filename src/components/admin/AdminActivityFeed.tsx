import { motion, useReducedMotion } from 'framer-motion'
import { RefreshCw, Download, BellRing, Database, CalendarClock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { adminActivity, type AdminActivity } from '../../data/admin'

const KIND_META: Record<AdminActivity['kind'], { icon: LucideIcon; className: string }> = {
  reconnect: { icon: RefreshCw, className: 'text-teal-accent bg-teal-50' },
  firmware: { icon: Download, className: 'text-deep-teal bg-teal-50' },
  alert: { icon: BellRing, className: 'text-warning bg-amber-50' },
  reading: { icon: Database, className: 'text-primary-green bg-soft-mint' },
  schedule: { icon: CalendarClock, className: 'text-secondary-text bg-main-bg' },
}

/** Admin activity feed for the console. */
const AdminActivityFeed = () => {
  const reduce = useReducedMotion()

  return (
    <div className="space-y-4">
      {adminActivity.map((a, i) => {
        const meta = KIND_META[a.kind]
        const Icon = meta.icon
        return (
          <motion.div
            key={a.id}
            initial={reduce ? undefined : { opacity: 0, x: -12 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-3"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-10 ${meta.className}`}>
              <Icon size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-main-text">{a.title}</p>
              <p className="text-xs text-secondary-text">{a.detail}</p>
            </div>
            <span className="shrink-0 text-xs font-medium tabular-nums text-secondary-text">{a.time}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

export default AdminActivityFeed
