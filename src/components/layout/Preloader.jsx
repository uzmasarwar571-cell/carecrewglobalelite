import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks';
import { EASE } from '../../utils/motion';

/**
 * Brief brand moment on first paint — logo, a line that draws itself,
 * then out of the way. Capped at ~1.4s and skipped entirely for
 * reduced-motion visitors and on repeat visits within a session.
 */
export function Preloader() {
  const prefersReduced = usePrefersReducedMotion();

  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem('ccm_preloaded') !== '1';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) return undefined;

    document.body.style.overflow = 'hidden';
    const duration = prefersReduced ? 320 : 1400;

    const timer = window.setTimeout(() => {
      setVisible(false);
      try {
        window.sessionStorage.setItem('ccm_preloaded', '1');
      } catch {
        /* ignore */
      }
    }, duration);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [visible, prefersReduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: EASE } }}
          className="fixed inset-0 z-[200] grid place-items-center bg-emerald-950"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex items-center gap-3"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800">
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                  <path
                    d="M3.6 10.4 12 3.6l8.4 6.8"
                    fill="none"
                    stroke="#DCC17C"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.6 11.6v7.2a1.2 1.2 0 0 0 1.2 1.2h10.4a1.2 1.2 0 0 0 1.2-1.2v-7.2"
                    fill="none"
                    stroke="#FAF6EF"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 17.4c-1.9-1.35-3-2.35-3-3.55a1.55 1.55 0 0 1 3-.6 1.55 1.55 0 0 1 3 .6c0 1.2-1.1 2.2-3 3.55Z"
                    fill="#DCC17C"
                  />
                </svg>
              </span>
              <span className="font-display text-[19px] font-semibold tracking-tight text-cream-50">
                Care Crew <span className="text-gold-300">Maid</span>
              </span>
            </motion.div>

            {/* The line that draws itself. */}
            <div className="mt-6 h-px w-40 overflow-hidden rounded-full bg-cream-50/12 xs:w-52">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: prefersReduced ? 0 : '0%' }}
                transition={{ duration: prefersReduced ? 0.2 : 1.1, ease: EASE }}
                className="h-full w-full bg-gradient-to-r from-emerald-500 via-gold-300 to-emerald-500"
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-cream-200/40"
            >
              Trusted Domestic Staff
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Preloader;
