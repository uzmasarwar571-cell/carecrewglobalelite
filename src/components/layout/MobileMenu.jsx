import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Phone, MessageCircle, ArrowRight, Mail } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLockBodyScroll, useFocusTrap, usePrefersReducedMotion } from '../../hooks';
import { useUI } from '../../context/UIProvider';
import { getNavLinks } from './navLinks';
import { businessConfig, whatsappMessages } from '../../config/business';
import { openWhatsApp, telHref, mailHref } from '../../utils/whatsapp';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { EASE } from '../../utils/motion';

/** Full-screen mobile navigation panel. */
export function MobileMenu({ onClose, onNavigate, activeSection }) {
  const panelRef = useRef(null);
  const prefersReduced = usePrefersReducedMotion();
  const { openBooking } = useUI();

  useLockBodyScroll(true);
  useFocusTrap(panelRef, true);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const panelVariants = prefersReduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, x: '100%' },
        show: { opacity: 1, x: 0, transition: { duration: 0.42, ease: EASE } },
        exit: { opacity: 0, x: '100%', transition: { duration: 0.3, ease: 'easeIn' } },
      };

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } },
  };

  const itemVariants = prefersReduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: 24 },
        show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
      };

  return createPortal(
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      variants={panelVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-[95] flex flex-col bg-emerald-950 lg:hidden"
    >
      {/* Ambient wash so the panel is not a flat block of colour. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(70% 45% at 85% 0%, rgba(44,125,99,0.35) 0%, rgba(6,26,22,0) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between px-5 xs:px-6" style={{ height: 'var(--nav-height)' }}>
        <Logo tone="light" onClick={(event) => { event.preventDefault(); onNavigate('home'); }} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid h-11 w-11 place-items-center rounded-full border border-cream-50/20 text-cream-50 transition-colors hover:bg-cream-50/10"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="scrollbar-slim relative flex-1 overflow-y-auto px-5 pb-8 pt-2 xs:px-6">
        <motion.ul variants={listVariants} initial="hidden" animate="show" className="space-y-0.5">
          {getNavLinks().map((link, index) => (
            <motion.li key={link.id} variants={itemVariants}>
              <a
                href={`#${link.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(link.id);
                }}
                aria-current={activeSection === link.id ? 'true' : undefined}
                className={cn(
                  'group flex items-center justify-between gap-4 border-b border-cream-50/[0.08] py-4 transition-colors duration-200',
                  activeSection === link.id ? 'text-gold-300' : 'text-cream-100 hover:text-gold-200'
                )}
              >
                <span className="flex items-baseline gap-3.5">
                  <span className="w-5 shrink-0 text-fluid-xs font-semibold tabular-nums text-cream-200/35">
                    0{index + 1}
                  </span>
                  <span className="font-display text-[clamp(1.35rem,6vw,1.75rem)] font-semibold tracking-tight">
                    {link.label}
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 -translate-x-1 opacity-0 transition-all duration-300 ease-premium group-hover:translate-x-0 group-hover:opacity-60"
                  aria-hidden="true"
                />
              </a>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.42 }}
          className="mt-7 space-y-3"
        >
          <Button
            size="lg"
            fullWidth
            icon={ArrowRight}
            onClick={() => {
              onClose();
              window.setTimeout(() => openBooking(), 220);
            }}
          >
            Book a Maid
          </Button>

          <Button
            size="lg"
            fullWidth
            variant="whatsapp"
            icon={MessageCircle}
            iconPosition="left"
            onClick={() => openWhatsApp(whatsappMessages.general)}
          >
            WhatsApp Us
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.48 }}
          className="mt-8 space-y-3 border-t border-cream-50/[0.08] pt-6"
        >
          <a
            href={telHref}
            className="flex items-center gap-3 text-cream-200/80 transition-colors hover:text-cream-50"
          >
            <Phone className="h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
            <span className="text-fluid-sm font-medium">{businessConfig.phone}</span>
          </a>
          <a
            href={mailHref}
            className="flex items-center gap-3 break-all text-cream-200/80 transition-colors hover:text-cream-50"
          >
            <Mail className="h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
            <span className="text-fluid-sm font-medium">{businessConfig.email}</span>
          </a>
          <p className="pt-1 text-fluid-xs text-cream-200/45">
            {businessConfig.hours[0].days} · {businessConfig.hours[0].time}
          </p>
        </motion.div>
      </div>
    </motion.div>,
    document.body
  );
}

export default MobileMenu;
