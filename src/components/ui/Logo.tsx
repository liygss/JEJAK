import { useState } from 'react'
import { Activity } from 'lucide-react'

const LOGO_SRC = '/logo-jejak.jpeg'

type LogoSize = 'sm' | 'md' | 'lg'
type LogoVariant = 'plain' | 'framed'

interface LogoProps {
  size?: LogoSize
  variant?: LogoVariant
  showWordmark?: boolean
  showTagline?: boolean
  className?: string
  tone?: 'dark' | 'light'
}

const sizeMap: Record<LogoSize, { box: string; word: string; tag: string; fallback: number }> = {
  sm: { box: 'h-8 w-8', word: 'text-base', tag: 'text-[10px]', fallback: 16 },
  md: { box: 'h-10 w-10', word: 'text-lg', tag: 'text-[11px]', fallback: 20 },
  lg: { box: 'h-12 w-12', word: 'text-2xl', tag: 'text-xs', fallback: 24 },
}

const Logo = ({
  size = 'md',
  variant = 'plain',
  showWordmark = true,
  showTagline = false,
  className = '',
  tone = 'dark',
}: LogoProps) => {
  const s = sizeMap[size]
  const [failed, setFailed] = useState(false)

  const boxClass =
    variant === 'framed'
      ? 'overflow-hidden rounded-12 border border-border bg-white shadow-sm'
      : 'overflow-hidden rounded-10'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className={`${s.box} ${boxClass} flex shrink-0 items-center justify-center`}>
        {failed ? (
          <span className="flex h-full w-full items-center justify-center rounded-10 bg-primary-green text-white">
            <Activity size={s.fallback} />
          </span>
        ) : (
          <img
            src={LOGO_SRC}
            alt="JEJAK logo"
            className="h-full w-full object-contain"
            loading="eager"
            draggable={false}
            onError={() => setFailed(true)}
          />
        )}
      </span>
      {showWordmark && (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={`${s.word} font-extrabold tracking-tight ${
              tone === 'light' ? 'text-white' : 'text-main-text'
            }`}
          >
            JEJAK
          </span>
          {showTagline && (
            <span
              className={`${s.tag} mt-0.5 font-medium ${
                tone === 'light' ? 'text-white/70' : 'text-secondary-text'
              }`}
            >
              Kecerdasan Industri Berbasis AI
            </span>
          )}
        </span>
      )}
    </div>
  )
}

export default Logo
