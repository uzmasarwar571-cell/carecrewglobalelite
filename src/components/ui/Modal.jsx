import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLockBodyScroll, useFocusTrap, usePrefersReducedMotion } from '../../hooks';
import { backdrop, modalPanel, reduce } from '../../utils/motion';

/**
 * Accessible dialog:
 *  · Escape closes  · click outside closes  · focus is trapped
 *  · background scroll locked  · focus returns to the trigger
 *  · full-height sheet on phones, centred panel from `sm` upwards
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  labelledBy,
  className,
}) {
  const panelRef = useRef(null);
  const prefersReduced = usePrefersReducedMotion();

  useLockBodyScroll(open);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const sizes = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-xl',
    lg: 'sm:max-w-3xl',
    xl: 'sm:max-w-4xl',
  };

  const headingId = labelledBy || (title ? 'modal-title' : undefined);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-emerald-950/55 backdrop-blur-[3px]"
            variants={backdrop}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            aria-describedby={description ? 'modal-description' : undefined}
            tabIndex={-1}
            variants={reduce(modalPanel, prefersReduced)}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-cream-50 shadow-lift',
              'rounded-t-panel sm:rounded-panel',
              sizes[size] ?? sizes.md,
              className
            )}
          >
            {/* Grab handle — signals the sheet is dismissible on touch. */}
            <div className="flex justify-center pt-3 sm:hidden" aria-hidden="true">
              <span className="h-1 w-10 rounded-full bg-emerald-900/15" />
            </div>

            {(title || onClose) && (
              <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-4 sm:px-7 sm:pt-6">
                <div className="min-w-0">
                  {title && (
                    <h2 id={headingId} className="text-fluid-h3 font-semibold">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="modal-description" className="mt-1 text-fluid-sm text-charcoal-500">
                      {description}
                    </p>
                  )}
                </div>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="-mr-1 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-charcoal-500 transition-colors duration-200 hover:bg-emerald-900/[0.06] hover:text-emerald-900"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7">
              {children}
            </div>

            {footer && (
              <div className="border-t border-emerald-900/[0.08] bg-cream-100/70 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;
