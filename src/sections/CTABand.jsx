import { ArrowRight, MessageCircle, PhoneCall } from 'lucide-react';
import { useUI } from '../context/UIProvider';
import { whatsappMessages } from '../config/business';
import { siteCopy } from '../data/copy';
import { openWhatsApp } from '../utils/whatsapp';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';

/** Final conversion push before the contact details. */
export function CTABand() {
  const { openBooking, openCallback } = useUI();
  const copy = siteCopy.cta;

  return (
    <section className="relative overflow-hidden bg-cream-50 py-section" aria-labelledby="cta-heading">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-panel bg-emerald-900 px-6 py-12 text-center sm:px-10 sm:py-16">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(60% 70% at 50% 0%, rgba(44,125,99,0.45) 0%, rgba(11,42,35,0) 100%)',
              }}
              aria-hidden="true"
            />
            <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" aria-hidden="true" />

            {/* Decorative rings */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-cream-50/[0.06]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full border border-cream-50/[0.05]"
              aria-hidden="true"
            />

            <div className="relative mx-auto max-w-2xl">
              <h2 id="cta-heading" className="text-fluid-h2 font-semibold text-cream-50">
                {copy.title}
              </h2>
              <p className="mt-4 text-fluid-lead text-cream-200/70">{copy.description}</p>

              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 xs:flex-row xs:flex-wrap">
                <Button size="lg" variant="gold" icon={ArrowRight} onClick={() => openBooking()}>
                  {copy.primary}
                </Button>
                <Button
                  size="lg"
                  variant="whatsapp"
                  icon={MessageCircle}
                  iconPosition="left"
                  onClick={() => openWhatsApp(whatsappMessages.general)}
                >
                  {copy.whatsapp}
                </Button>
                <Button
                  size="lg"
                  variant="onDark"
                  icon={PhoneCall}
                  iconPosition="left"
                  onClick={openCallback}
                >
                  {copy.callback}
                </Button>
              </div>

              <p className="mt-6 text-fluid-xs text-cream-200/45">{copy.note}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default CTABand;
