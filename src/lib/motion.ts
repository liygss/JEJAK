import { useReducedMotion, type Variants, type Transition } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

export const baseTransition: Transition = {
  duration: 0.45,
  ease: EASE,
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: baseTransition },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: baseTransition },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: baseTransition },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: baseTransition },
}

// Opacity-only so it never creates a containing block that would break the
// sticky dashboard header inside the animated wrapper.
export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.16, ease: 'easeIn' } },
}

/**
 * Returns `always` / `whileInView` motion props that automatically collapse to
 * no-op animations when the user prefers reduced motion.
 */
export function useMotionSafe() {
  const reduce = useReducedMotion()

  const inView = (variants: Variants, className?: string) =>
    reduce
      ? { className, initial: false as const, animate: 'visible' as const, variants }
      : {
          className,
          initial: 'hidden' as const,
          whileInView: 'visible' as const,
          viewport: { once: true, margin: '-60px' },
          variants,
        }

  const mount = (variants: Variants, className?: string) =>
    reduce
      ? { className, initial: false as const, animate: 'visible' as const, variants }
      : { className, initial: 'hidden' as const, animate: 'visible' as const, variants }

  const hoverLift = reduce
    ? {}
    : { whileHover: { y: -4, transition: { duration: 0.2, ease: EASE } } }

  return { reduce, inView, mount, hoverLift }
}
