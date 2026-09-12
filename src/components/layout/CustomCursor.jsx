import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useIsDesktop, usePrefersReducedMotion } from '../../hooks';

/**
 * Subtle cursor companion: a small dot that tracks precisely, plus a
 * ring that lags slightly and expands over interactive elements.
 *
 * Deliberately additive — the native cursor is never hidden, so
 * usability and accessibility are unaffected. Desktop pointers only.
 */
export function CustomCursor() {
  const isDesktop = useIsDesktop();
  const prefersReduced = usePrefersReducedMotion();
  const enabled = isDesktop && !prefersReduced;

  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const ringX = useSpring(x, { stiffness: 240, damping: 26, mass: 0.45 });
  const ringY = useSpring(y, { stiffness: 240, damping: 26, mass: 0.45 });

  useEffect(() => {
    if (!enabled) return undefined;

    const interactiveSelector = 'a, button, [role="button"], input, select, textarea, label';

    const onMove = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
      if (!visible) setVisible(true);
      const target = event.target;
      setActive(Boolean(target?.closest?.(interactiveSelector)));
    };

    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled, visible, x, y]);

  if (!enabled) return null;

  return (
    <div className="custom-cursor pointer-events-none fixed inset-0 z-[150]" aria-hidden="true">
      {/* Precise dot */}
      <motion.span
        className="absolute h-1.5 w-1.5 rounded-full bg-emerald-700"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible ? (active ? 0 : 0.9) : 0 }}
        transition={{ duration: 0.18 }}
      />
      {/* Trailing ring */}
      <motion.span
        className="absolute rounded-full border border-emerald-700/45"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: active ? 44 : 26,
          height: active ? 44 : 26,
          opacity: visible ? (active ? 0.85 : 0.4) : 0,
          backgroundColor: active ? 'rgba(44,125,99,0.10)' : 'rgba(44,125,99,0)',
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      />
    </div>
  );
}

export default CustomCursor;
