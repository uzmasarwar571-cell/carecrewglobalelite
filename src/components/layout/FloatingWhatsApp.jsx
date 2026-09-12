import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { whatsappMessages } from '../../config/business';
import { buildWhatsAppUrl } from '../../utils/whatsapp';
import { usePrefersReducedMotion, useScrollY } from '../../hooks';

/**
 * Floating WhatsApp button.
 * On phones it is folded into the fixed bottom action bar instead, so
 * this only renders from `lg` up — two floating WhatsApp entry points
 * on a small screen would just be clutter.
 */
export function FloatingWhatsApp() {
  const [hovered, setHovered] = useState(false);
  const prefersReduced = usePrefersReducedMotion();
  const scrollY = useScrollY();
  const visible = scrollY > 320;

  // Nudge the tooltip open once, so the button explains itself.
  const [autoHinted, setAutoHinted] = useState(false);
  useEffect(() => {
    if (!visible || autoHinted) return undefined;
    const show = window.setTimeout(() => setHovered(true), 700);
    const hide = window.setTimeout(() => {
      setHovered(false);
      setAutoHinted(true);
    }, 4200);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [visible, autoHinted]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-5 z-[80] hidden lg:block"
        >
          <div
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Tooltip */}
            <AnimatePresence>
              {hovered && (
                <motion.span
                  initial={{ opacity: 0, x: 8, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  role="tooltip"
                  className="pointer-events-none absolute right-[calc(100%+14px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl bg-emerald-900 px-4 py-2.5 text-fluid-sm font-semibold text-cream-50 shadow-lift"
                >
                  Chat with us on WhatsApp
                  <span
                    className="absolute right-[-5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-emerald-900"
                    aria-hidden="true"
                  />
                </motion.span>
              )}
            </AnimatePresence>

            {/* Pulse rings */}
            {!prefersReduced && (
              <>
                <span
                  className="absolute inset-0 -z-10 rounded-full bg-[#1FA855]/35 animate-pulse-ring"
                  aria-hidden="true"
                />
                <span
                  className="absolute inset-0 -z-10 rounded-full bg-[#1FA855]/25 animate-pulse-ring [animation-delay:1.2s]"
                  aria-hidden="true"
                />
              </>
            )}

            <motion.a
              href={buildWhatsAppUrl(whatsappMessages.general)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Care Crew Maid on WhatsApp"
              whileHover={prefersReduced ? undefined : { scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              className="grid h-14 w-14 place-items-center rounded-full bg-[#1FA855] text-white shadow-lift ring-1 ring-black/[0.06] transition-colors duration-300 hover:bg-[#188A45]"
            >
              <MessageCircle className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
            </motion.a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingWhatsApp;
