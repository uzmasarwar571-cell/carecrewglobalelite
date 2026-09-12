import { HeartHandshake, ArrowRight, MessageCircle, PhoneCall } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUI } from '../../context/UIProvider';
import { useExitIntent, useSessionOnce, useIsDesktop } from '../../hooks';
import { whatsappMessages } from '../../config/business';
import { settings } from '../../config/settings';
import { openWhatsApp } from '../../utils/whatsapp';

/**
 * Exit-intent prompt. Desktop only, once per session, and armed only
 * after the visitor has been on the page a while — so it reads as a
 * last offer of help rather than a trap.
 */
export function ExitIntentPopup() {
  const config = settings.popups?.exitIntent || {};
  const [shown, markShown] = useSessionOnce('ccm_exit_shown');
  const isDesktop = useIsDesktop();
  // Open state lives in the shared store so this dialog counts towards
  // `anyDialogOpen` — otherwise the welcome nudge would sit behind it.
  const { openBooking, openCallback, anyDialogOpen, exitIntentOpen, openExitIntent, closeExitIntent } =
    useUI();

  useExitIntent(
    () => {
      // Never stack on top of a dialog the visitor opened themselves.
      if (shown || anyDialogOpen) return;
      openExitIntent();
      markShown();
    },
    { enabled: isDesktop && !shown, delay: config.delay ?? 15000 }
  );

  const open = exitIntentOpen;
  const close = closeExitIntent;

  return (
    <Modal open={open} onClose={close} size="sm" labelledBy="exit-title">
      <div className="py-2 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-700/[0.08] text-emerald-700">
          <HeartHandshake className="h-8 w-8" aria-hidden="true" />
        </span>

        <h2 id="exit-title" className="mt-5 text-fluid-h3 font-semibold">
          {config.title}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-fluid-sm text-charcoal-500">{config.body}</p>

        <div className="mt-7 space-y-2.5">
          <Button
            fullWidth
            icon={ArrowRight}
            onClick={() => {
              close();
              openBooking();
            }}
          >
            {config.primaryCta}
          </Button>

          <div className="flex flex-col gap-2.5 xs:flex-row">
            <Button
              className="xs:flex-1"
              variant="whatsapp"
              icon={MessageCircle}
              iconPosition="left"
              onClick={() => {
                close();
                openWhatsApp(whatsappMessages.general);
              }}
            >
              {config.whatsappCta}
            </Button>
            <Button
              className="xs:flex-1"
              variant="outline"
              icon={PhoneCall}
              iconPosition="left"
              onClick={() => {
                close();
                openCallback();
              }}
            >
              {config.callbackCta}
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={close}
          className="mt-4 text-fluid-xs text-charcoal-400 transition-colors hover:text-charcoal-600"
        >
          {config.dismissLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ExitIntentPopup;
