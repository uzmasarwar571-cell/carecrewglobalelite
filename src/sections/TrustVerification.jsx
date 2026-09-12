import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { verificationSteps } from '../data/content';
import { siteCopy } from '../data/copy';
import { images } from '../config/images';
import { useUI } from '../context/UIProvider';
import { whatsappMessages } from '../config/business';
import { openWhatsApp } from '../utils/whatsapp';
import { SmartImage } from '../components/ui/SmartImage';
import { Button } from '../components/ui/Button';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal';

/**
 * The objection-handling section: "can I trust this person in my home?"
 * Deliberately specific about what we do and do not check — vague
 * safety claims are what make these sites feel untrustworthy.
 */
export function TrustVerification() {
  const { openBooking } = useUI();
  const copy = siteCopy.trust;

  return (
    <section
      id="trust"
      className="section-padding relative overflow-hidden bg-emerald-900"
      aria-labelledby="trust-heading"
    >
      {/* Background image, heavily tinted. */}
      <div className="absolute inset-0" aria-hidden="true">
        <SmartImage
          src={images.trust.src}
          alt=""
          ratio="auto"
          className="h-full w-full"
          imgClassName="h-full w-full"
        />
        <div className="absolute inset-0 bg-emerald-950/[0.93]" />
        {/* Kept low: the radial is atmosphere, not illumination. Pushing it
            higher lifts the photo back through the tint and costs contrast
            on the headline. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(70% 55% at 20% 15%, rgba(44,125,99,0.20) 0%, rgba(6,26,22,0) 100%)',
          }}
        />
      </div>
      <div className="bg-grain absolute inset-0 opacity-[0.08] mix-blend-overlay" aria-hidden="true" />

      <div className="container relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* ── Heading column ─────────────────────────── */}
          <div className="lg:col-span-5">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-pill border border-gold-300/25 bg-gold-300/[0.08] px-3.5 py-1.5 text-fluid-xs font-bold uppercase tracking-[0.14em] text-gold-200">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.eyebrow}
              </span>
            </Reveal>

            <Reveal delay={0.05} as="h2" id="trust-heading" className="mt-5 text-fluid-h2 font-semibold text-cream-50">
              {copy.title}
            </Reveal>

            <Reveal delay={0.1} as="p" className="mt-5 text-fluid-lead text-cream-200/70">
              {copy.description}
            </Reveal>

            <Reveal delay={0.15} className="mt-8 flex flex-col gap-3 xs:flex-row lg:flex-col xl:flex-row">
              <Button size="lg" variant="gold" icon={ArrowRight} onClick={() => openBooking()}>
                {copy.ctaPrimary}
              </Button>
              <Button
                size="lg"
                variant="onDark"
                icon={MessageCircle}
                iconPosition="left"
                onClick={() => openWhatsApp(whatsappMessages.general)}
              >
                {copy.ctaSecondary}
              </Button>
            </Reveal>

            <Reveal delay={0.2} className="mt-8 rounded-2xl border border-cream-50/[0.09] bg-cream-50/[0.04] p-4">
              <p className="text-fluid-xs leading-relaxed text-cream-200/55">{copy.note}</p>
            </Reveal>
          </div>

          {/* ── Checklist column ───────────────────────── */}
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:col-span-7" staggerChildren={0.07}>
            {verificationSteps.map((step, index) => (
              <RevealItem
                key={step.title}
                className="group relative overflow-hidden rounded-card border border-cream-50/[0.09] bg-cream-50/[0.045] p-5 backdrop-blur-sm transition-colors duration-500 ease-premium hover:border-gold-300/25 hover:bg-cream-50/[0.075]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-gold-300 transition-colors duration-500 group-hover:bg-gold-300 group-hover:text-emerald-950">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span
                    className="font-display text-fluid-h4 font-semibold text-cream-50/12"
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-4 text-fluid-h4 font-semibold text-cream-50">{step.title}</h3>
                <p className="mt-2 text-fluid-sm leading-relaxed text-cream-200/65">
                  {step.description}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

export default TrustVerification;
