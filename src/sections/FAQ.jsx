import { MessageCircle, ArrowRight } from 'lucide-react';
import { faqs } from '../data/faqs';
import { whatsappMessages } from '../config/business';
import { siteCopy } from '../data/copy';
import { openWhatsApp } from '../utils/whatsapp';
import { useUI } from '../context/UIProvider';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Accordion } from '../components/ui/Accordion';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';

export function FAQ() {
  const { openBooking } = useUI();
  const copy = siteCopy.faq;

  return (
    <section id="faqs" className="section-padding bg-cream-100" aria-labelledby="faq-heading">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* ── Sticky intro ───────────────────────────── */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--nav-height)+2rem)]">
              <SectionHeading
                id="faq-heading"
                align="left"
                eyebrow={copy.eyebrow}
                title={copy.title}
                description={copy.description}
                className="max-w-none"
              />

              <Reveal delay={0.15} className="mt-7 rounded-card border border-emerald-900/[0.07] bg-cream-50 p-5">
                <p className="text-fluid-sm font-semibold text-emerald-900">{copy.helpTitle}</p>
                <p className="mt-1.5 text-fluid-sm text-charcoal-500">{copy.helpText}</p>
                <div className="mt-4 flex flex-col gap-2.5 xs:flex-row lg:flex-col xl:flex-row">
                  <Button
                    size="sm"
                    variant="whatsapp"
                    icon={MessageCircle}
                    iconPosition="left"
                    onClick={() => openWhatsApp(whatsappMessages.general)}
                  >
                    {copy.ctaWhatsapp}
                  </Button>
                  <Button size="sm" variant="outline" icon={ArrowRight} onClick={() => openBooking()}>
                    {copy.ctaBook}
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>

          {/* ── Accordion ──────────────────────────────── */}
          <Reveal delay={0.1} className="lg:col-span-8">
            <div className="rounded-panel border border-emerald-900/[0.07] bg-cream-50 px-5 shadow-soft sm:px-8">
              {/* Open the first question by id — the list is CMS-managed,
                  so a hardcoded id would stop matching. */}
              <Accordion items={faqs} defaultOpen={faqs[0]?.id} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
