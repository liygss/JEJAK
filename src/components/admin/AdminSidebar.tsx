import { Link, NavLink } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Activity, LayoutGrid, Cpu, BellRing, Wrench, ArrowLeftRight, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'
import Logo from '../ui/Logo'

const navItems = [
  { to: '/admin', icon: LayoutGrid, label: 'Armada', end: true },
  { to: '/admin/devices', icon: Cpu, label: 'Perangkat', end: false },
  { to: '/admin/alerts', icon: BellRing, label: 'Peringatan', end: false },
  { to: '/admin/maintenance', icon: Wrench, label: 'Perawatan', end: false },
]

interface AdminSidebarProps {
  onNavigate?: () => void
  instanceId?: string
}

const AdminSidebar = ({ onNavigate, instanceId = 'admin-desktop' }: AdminSidebarProps) => {
  const reduce = useReducedMotion()
  const pillId = `admin-active-${instanceId}`

  return (
    <aside className="sticky top-0 z-30 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface shadow-sm">
      <div className="border-b border-border p-4 lg:p-5">
        <Logo size="md" showTagline />
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-deep-teal/10 px-2.5 py-1 text-[11px] font-semibold text-deep-teal">
          <ShieldCheck size={13} /> Konsol Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'relative flex w-full items-center gap-3 rounded-12 px-3 py-2.5 text-left text-sm font-medium transition-colors',
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
                <item.icon size={19} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-2">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-text/70">
            Peran
          </p>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-12 px-3 py-2.5 text-sm font-medium text-secondary-text transition-colors hover:bg-slate-50 hover:text-main-text"
          >
            <ArrowLeftRight size={19} /> Kembali ke Pengguna
          </Link>
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-12 bg-main-bg px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-main-text">
            <Activity size={14} className="text-deep-teal" /> Telemetri Armada
          </p>
          <p className="mt-0.5 text-xs text-secondary-text">Status perangkat &amp; konektivitas</p>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
