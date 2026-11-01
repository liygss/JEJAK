import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

const Drawer = ({ open, onClose, title, subtitle, children }: DrawerProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-main-text/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-border p-6">
              <div>
                <h3 className="text-lg font-semibold text-main-text">{title}</h3>
                {subtitle && <p className="mt-0.5 text-sm text-secondary-text">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-12 p-2 text-secondary-text transition-colors hover:bg-main-bg hover:text-main-text"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Drawer
