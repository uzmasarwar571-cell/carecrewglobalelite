import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, CalendarCheck } from 'lucide-react';
import { useScrollY } from '../../hooks';
import { useUI } from '../../context/UIProvider';
import { whatsappMessages } from '../../config/business';
import { buildWhatsAppUrl, telHref } from '../../utils/whatsapp';

/**
 * Fixed bottom bar on phones: WhatsApp · Call · Book Now.
 * Most Pakistani visitors arrive on mobile, so the three ways to
 * convert stay within thumb reach for the whole scroll.
 */
export function MobileActionBar() {
  const scrollY = useScrollY();
  const { openBooking } = useUI();
  const visible = scrollY > 260;

  const itemClass =
    'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold transition-colors duration-200 active:scale-[0.97]';

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Quick contact"
          className="fixed inset-x-0 bottom-0 z-[80] border-t border-emerald-900/[0.08] bg-cream-50/95 backdrop-blur-md lg:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="mx-auto flex max-w-lg items-stretch gap-1 px-2">
            <a
              href={buildWhatsAppUrl(whatsappMessages.general)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${itemClass} text-[#1FA855]`}
            >
              <MessageCircle className="h-[22px] w-[22px]" aria-hidden="true" />
              WhatsApp
            </a>

            <span className="my-3 w-px bg-emerald-900/[0.08]" aria-hidden="true" />

            <a href={telHref} className={`${itemClass} text-emerald-800`}>
              <Phone className="h-[22px] w-[22px]" aria-hidden="true" />
              Call
            </a>

            <button
              type="button"
              onClick={() => openBooking()}
              className="my-2 ml-1 flex flex-[1.35] items-center justify-center gap-2 rounded-pill bg-emerald-700 px-3 text-fluid-sm font-semibold text-cream-50 shadow-soft transition-colors duration-200 active:bg-emerald-900"
            >
              <CalendarCheck className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              Book Now
            </button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export default MobileActionBar;
