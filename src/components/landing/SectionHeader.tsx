import type { ReactNode } from 'react'

interface SectionHeaderProps {
  eyebrow: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className = '',
}: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <div className={`${centered ? 'text-center mx-auto' : ''} ${className}`}>
      <p className="sm:text-28 text-18 text-secondary-text">{eyebrow}</p>
      <h2
        className={`text-main-text sm:text-40 text-30 font-semibold tracking-tight mt-3 ${
          centered ? 'mx-auto max-w-3xl' : ''
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-secondary-text text-18 mt-4 ${centered ? 'mx-auto max-w-2xl' : 'max-w-xl'}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
