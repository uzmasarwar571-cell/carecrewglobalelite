import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useUI } from '../../context/UIProvider';
import { cn } from '../../utils/cn';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const tones = {
  success: 'border-emerald-600/25 bg-emerald-700 text-cream-50',
  error: 'border-red-500/25 bg-red-600 text-white',
  info: 'border-emerald-900/12 bg-emerald-900 text-cream-50',
};

/**
 * Toast stack. Sits above the mobile action bar so it never covers the
 * primary CTAs on a phone.
 */
export function Toasts() {
  const { toasts, dismissToast } = useUI();

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 z-[120] flex flex-col items-center gap-2 px-4"
      style={{ bottom: 'calc(var(--mobile-bar) + 16px + env(safe-area-inset-bottom))' }}
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant] || Info;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="status"
              aria-live="polite"
              className={cn(
                'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-lift',
                tones[toast.variant] || tones.info
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-fluid-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-0.5 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}

export default Toasts;
