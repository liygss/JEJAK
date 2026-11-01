import { createContext, useContext, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import AdminSidebar from '../admin/AdminSidebar'
import { FiltersProvider } from '../../lib/FiltersContext'
import { pageTransition } from '../../lib/motion'

type SidebarContextValue = { openSidebar: () => void }
const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useAdminSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useAdminSidebar must be used within AdminLayout')
  return ctx
}

function Shell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setMobileOpen(true) }}>
      <div className="flex min-h-screen bg-main-bg">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-main-text/30 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                className="relative z-10 h-full w-64"
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-12 p-2 text-secondary-text hover:bg-slate-50"
                >
                  <X size={18} />
                </button>
                <AdminSidebar instanceId="admin-mobile" onNavigate={() => setMobileOpen(false)} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex min-h-full flex-1 flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

const AdminLayout = () => (
  <FiltersProvider>
    <Shell />
  </FiltersProvider>
)

export default AdminLayout
