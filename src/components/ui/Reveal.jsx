import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks';
import { fadeUp, stagger, viewportOnce, reduce } from '../../utils/motion';

/**
 * Scroll-triggered reveal. Wraps children in a motion element that
 * fades and lifts once, when it enters the viewport.
 * Collapses to a plain fade when the user prefers reduced motion.
 */
export function Reveal({
  children,
  as = 'div',
  delay = 0,
  className,
  variants,
  amount,
  ...props
}) {
  const prefersReduced = usePrefersReducedMotion();
  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      className={className}
      variants={reduce(variants || fadeUp, prefersReduced)}
      initial="hidden"
      whileInView="show"
      viewport={amount ? { ...viewportOnce, amount } : viewportOnce}
      transition={delay ? { delay } : undefined}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Parent for staggered lists. Children should use <RevealItem> (or any
 * motion element with `hidden`/`show` variants) — no per-item delay
 * maths required.
 */
export function RevealGroup({
  children,
  as = 'div',
  className,
  staggerChildren = 0.08,
  delayChildren = 0,
  amount,
  ...props
}) {
  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      className={className}
      variants={stagger(staggerChildren, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={amount ? { ...viewportOnce, amount } : viewportOnce}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({ children, as = 'div', className, variants, ...props }) {
  const prefersReduced = usePrefersReducedMotion();
  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag className={className} variants={reduce(variants || fadeUp, prefersReduced)} {...props}>
      {children}
    </MotionTag>
  );
}

export default Reveal;
