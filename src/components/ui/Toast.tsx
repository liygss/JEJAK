import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastVariant = 'success' | 'warning' | 'info'

type Toast = {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

type ToastContextValue = {
  toast: (t: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle; color: string }> = {
  success: { icon: CheckCircle, color: 'text-primary-green' },
  warning: { icon: AlertCircle, color: 'text-warning' },
  info: { icon: Info, color: 'text-teal-accent' },
}

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = ++counter
      setToasts((prev) => [...prev, { ...t, id }])
      window.setTimeout(() => dismiss(id), 3500)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex w-80 flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const config = variantConfig[t.variant]
            const Icon = config.icon
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 32, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3 rounded-12 border border-border bg-surface p-4 shadow-lg"
              >
                <Icon size={18} className={`${config.color} mt-0.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-main-text">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-secondary-text">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-secondary-text hover:text-main-text transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
