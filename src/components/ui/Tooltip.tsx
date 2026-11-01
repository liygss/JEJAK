import { useState, type ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
}

const Tooltip = ({ content, children }: TooltipProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-12 border border-border bg-main-text px-3 py-2 text-xs leading-relaxed text-white shadow-lg">
          {content}
        </span>
      )}
    </span>
  )
}

export default Tooltip
