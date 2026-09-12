import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { useUI } from '../../context/UIProvider';
import { useSessionOnce, usePrefersReducedMotion, useScrollY } from '../../hooks';
import { whatsappMessages } from '../../config/business';
import { settings } from '../../config/settings';
import { openWhatsApp } from '../../utils/whatsapp';
import { Button } from '../ui/Button';
import { EASE } from '../../utils/motion';

/**
 * Corner welcome nudge.
 *
 * Deliberately not a full-screen interstitial — it slides in at the
 * corner, waits, and never returns during the same session. It also
 * stays out of the way while any other dialog is open.
 *
 * Two gates before it appears: a delay AND the visitor having scrolled
 * past the hero. Without the scroll gate it lands on top of the hero's
 * own CTAs, which is exactly the kind of popup everyone hates.
 */
export function WelcomePopup(props) {
  // Timings and copy come from the admin panel; the props remain as an
  // override so the component can still be dropped in elsewhere.
  const config = settings.popups?.welcome || {};
  const delay = props.delay ?? config.delay ?? 9000;
  const afterScroll = props.afterScroll ?? config.afterScroll ?? 600;

  const [shown, markShown] = useSessionOnce('ccm_welcome_shown');
  const [waited, setWaited] = useState(false);
  const [open, setOpen] = useState(false);
  const prefersReduced = usePrefersReducedMotion();
  const scrollY = useScrollY();
  const { openBooking, anyDialogOpen } = useUI();

  useEffect(() => {
    if (shown) return undefined;
    const timer = window.setTimeout(() => setWaited(true), delay);
    return () => window.clearTimeout(timer);
  }, [shown, delay]);

  useEffect(() => {
    if (shown || open) return;
    if (waited && scrollY > afterScroll) setOpen(true);
  }, [shown, open, waited, scrollY, afterScroll]);

  const dismiss = () => {
    setOpen(false);
    markShown();
  };

  const visible = open && !anyDialogOpen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.4, ease: EASE }}
          aria-label="Welcome offer"
          className="fixed inset-x-4 z-[85] mx-auto max-w-sm overflow-hidden rounded-panel border border-emerald-900/[0.08] bg-cream-50 shadow-lift sm:inset-x-auto sm:left-6 sm:mx-0"
          style={{ bottom: 'calc(var(--mobile-bar) + 16px + env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full text-charcoal-400 transition-colors hover:bg-emerald-900/[0.06] hover:text-emerald-900"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="bg-emerald-900 px-5 pb-8 pt-5">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-gold-300/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gold-200">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {config.badge}
            </span>
            <h2 className="mt-3 pr-6 font-display text-fluid-h4 font-semibold text-cream-50">
              {config.title}
            </h2>
          </div>

          <div className="-mt-4 rounded-t-panel bg-cream-50 px-5 pb-5 pt-5">
            <p className="text-fluid-sm text-charcoal-500">{config.body}</p>

            <div className="mt-4 space-y-2.5">
              <Button
                fullWidth
                size="sm"
                icon={ArrowRight}
                onClick={() => {
                  dismiss();
                  openBooking();
                }}
              >
                {config.primaryCta}
              </Button>
              <Button
                fullWidth
                size="sm"
                variant="whatsapp"
                icon={MessageCircle}
                iconPosition="left"
                onClick={() => {
                  dismiss();
                  openWhatsApp(whatsappMessages.general);
                }}
              >
                {config.whatsappCta}
              </Button>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="mt-3 w-full text-center text-fluid-xs text-charcoal-400 transition-colors hover:text-charcoal-600"
            >
              {config.dismissLabel}
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default WelcomePopup;
