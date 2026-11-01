import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeUp, staggerContainer, staggerItem, baseTransition } from '../../lib/motion'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export const Reveal = ({ children, delay = 0, className }: RevealProps) => {
  const reduce = useReducedMotion()

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      transition={{ ...baseTransition, delay }}
    >
      {children}
    </motion.div>
  )
}

export const Stagger = ({ children, className }: { children: ReactNode; className?: string }) => {
  const reduce = useReducedMotion()

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  )
}

export const StaggerItem = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  )
}

export default Reveal
