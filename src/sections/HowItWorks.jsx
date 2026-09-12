import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { steps } from '../data/content';
import { siteCopy } from '../data/copy';
import { useUI } from '../context/UIProvider';
import { usePrefersReducedMotion } from '../hooks';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal';

/**
 * Four-step process. The connecting line draws itself as the section
 * scrolls — horizontal on desktop, vertical on mobile — which is what
 * makes the four cards read as one journey rather than a grid.
 */
export function HowItWorks() {
  const sectionRef = useRef(null);
  const prefersReduced = usePrefersReducedMotion();
  const { openBooking } = useUI();
  const copy = siteCopy.howItWorks;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 75%', 'end 65%'],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="section-padding relative overflow-hidden bg-emerald-950"
      aria-labelledby="how-heading"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(65% 50% at 50% 0%, rgba(44,125,99,0.25) 0%, rgba(6,26,22,0) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" aria-hidden="true" />

      <div className="container relative">
        <SectionHeading
          id="how-heading"
          tone="dark"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <div className="relative mt-14 lg:mt-20">
          {/* ── Connecting line: vertical on mobile ─────── */}
          <div
            className="absolute bottom-8 left-[27px] top-8 w-px bg-cream-50/[0.10] lg:hidden"
            aria-hidden="true"
          >
            <motion.div
              className="h-full w-full origin-top bg-gradient-to-b from-emerald-400 via-gold-300 to-emerald-400"
              style={{ scaleY: prefersReduced ? 1 : lineScale }}
            />
          </div>

          {/* ── Connecting line: horizontal on desktop ──── */}
          <div
            className="absolute left-[12.5%] right-[12.5%] top-[30px] hidden h-px bg-cream-50/[0.10] lg:block"
            aria-hidden="true"
          >
            <motion.div
              className="h-full w-full origin-left bg-gradient-to-r from-emerald-400 via-gold-300 to-emerald-400"
              style={{ scaleX: prefersReduced ? 1 : lineScale }}
            />
          </div>

          <RevealGroup
            className="grid gap-8 lg:grid-cols-4 lg:gap-6"
            staggerChildren={0.12}
          >
            {steps.map((step) => (
              <RevealItem
                key={step.number}
                className="relative flex gap-5 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
              >
                {/* Numbered node */}
                <div className="relative z-10 shrink-0">
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-cream-50/12 bg-emerald-900 font-display text-fluid-h4 font-semibold text-gold-300 shadow-lift">
                    {step.number}
                  </span>
                  <span
                    className="absolute inset-0 -z-10 rounded-full bg-emerald-500/20 blur-lg"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 pb-2 lg:mt-6 lg:px-2">
                  <span className="mb-3 hidden justify-center lg:flex" aria-hidden="true">
                    <step.icon className="h-5 w-5 text-emerald-300/70" />
                  </span>
                  <h3 className="text-fluid-h4 font-semibold text-cream-50">{step.title}</h3>
                  <p className="mt-2 text-fluid-sm leading-relaxed text-cream-200/65">
                    {step.description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <Reveal delay={0.15} className="mt-14 flex flex-col items-center gap-4 text-center">
          <Button size="lg" variant="gold" icon={ArrowRight} onClick={() => openBooking()}>
            {copy.cta}
          </Button>
          <p className="text-fluid-sm text-cream-200/50">{copy.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

export default HowItWorks;
