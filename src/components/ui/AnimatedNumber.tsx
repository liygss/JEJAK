import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  decimals?: number
  duration?: number
  className?: string
}

const AnimatedNumber = ({
  value,
  format,
  decimals = 1,
  duration = 1.1,
  className,
}: AnimatedNumberProps) => {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()

  const formatRef = useRef(format)
  formatRef.current = format

  const render = (n: number) => (formatRef.current ? formatRef.current(n) : n.toFixed(decimals))

  const [display, setDisplay] = useState(() => render(reduce ? value : 0))

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setDisplay(render(value))
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(render(latest)),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce, duration, decimals])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}

export default AnimatedNumber
