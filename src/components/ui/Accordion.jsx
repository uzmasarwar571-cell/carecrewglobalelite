import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePrefersReducedMotion } from '../../hooks';
import { EASE } from '../../utils/motion';

/**
 * Single-open accordion built on real buttons with aria-expanded /
 * aria-controls, so it works with a keyboard and a screen reader.
 */
export function Accordion({ items, defaultOpen = null, className }) {
  const [openId, setOpenId] = useState(defaultOpen);
  const baseId = useId();
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div className={cn('divide-y divide-emerald-900/[0.08]', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;

        return (
          <div key={item.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="group flex w-full items-start justify-between gap-4 py-5 text-left transition-colors duration-200 hover:text-emerald-700 sm:py-6"
              >
                <span
                  className={cn(
                    'text-fluid-h4 font-semibold transition-colors duration-200',
                    isOpen ? 'text-emerald-700' : 'text-emerald-900'
                  )}
                >
                  {item.question}
                </span>
                <span
                  className={cn(
                    'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ease-premium',
                    isOpen
                      ? 'rotate-45 border-emerald-700 bg-emerald-700 text-cream-50'
                      : 'border-emerald-900/15 text-emerald-700 group-hover:border-emerald-700/40 group-hover:bg-emerald-50'
                  )}
                  aria-hidden="true"
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: prefersReduced ? 0.01 : 0.36,
                    ease: EASE,
                    opacity: { duration: prefersReduced ? 0.01 : 0.24 },
                  }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-6 pr-8 text-fluid-base text-charcoal-500">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
