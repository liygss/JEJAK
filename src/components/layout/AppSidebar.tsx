import { NavLink } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  BarChart3,
  BatteryCharging,
  Leaf,
  Sparkles,
  FileText,
  ShieldCheck,
  PiggyBank,
  Settings,
} from 'lucide-react'
import { clsx } from 'clsx'
import Logo from '../ui/Logo'
import { useFilters } from '../../lib/FiltersContext'
import { PLANT_LABEL } from '../../lib/id'

const navItems = [
  { to: '/dashboard', icon: BarChart3, label: 'Ringkasan' },
  { to: '/dashboard/energy', icon: BatteryCharging, label: 'Pemantauan Energi' },
  { to: '/dashboard/carbon', icon: Leaf, label: 'MRV Karbon' },
  { to: '/dashboard/cbam', icon: ShieldCheck, label: 'Kepatuhan CBAM' },
  { to: '/dashboard/savings', icon: PiggyBank, label: 'Penghematan Energi' },
  { to: '/dashboard/insights', icon: Sparkles, label: 'Wawasan AI' },
  { to: '/dashboard/reports', icon: FileText, label: 'Laporan' },
  { to: '/dashboard/settings', icon: Settings, label: 'Pengaturan' },
]

interface AppSidebarProps {
  onNavigate?: () => void
  instanceId?: string
}

const AppSidebar = ({ onNavigate, instanceId = 'desktop' }: AppSidebarProps) => {
  const reduce = useReducedMotion()
  const { plant } = useFilters()
  const pillId = `sidebar-active-${instanceId}`

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface shadow-sm sticky top-0 z-30">
      <div className="border-b border-border p-4 lg:p-5">
        <Logo size="md" showTagline />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'relative flex items-center gap-3 rounded-12 px-3 py-2.5 text-sm font-medium transition-colors',
                reduce && isActive
                  ? 'bg-soft-mint text-primary-green'
                  : isActive
                    ? 'text-primary-green'
                    : 'text-secondary-text hover:bg-slate-50 hover:text-main-text'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !reduce && (
                  <motion.span
                    layoutId={pillId}
                    className="absolute inset-0 rounded-12 bg-soft-mint"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <item.icon size={20} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <div className="rounded-12 bg-main-bg px-3 py-2">
          <p className="text-xs font-medium text-main-text">{PLANT_LABEL[plant]}</p>
          <p className="mt-0.5 text-xs text-secondary-text">Pemantauan energi &amp; karbon</p>
        </div>
      </div>
    </aside>
  )
}

export default AppSidebar
