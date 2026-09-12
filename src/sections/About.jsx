import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Quote } from 'lucide-react';
import { values } from '../data/content';
import { siteCopy } from '../data/copy';
import { images } from '../config/images';
import { useUI } from '../context/UIProvider';
import { usePrefersReducedMotion } from '../hooks';
import { SectionHeading } from '../components/ui/SectionHeading';
import { SmartImage } from '../components/ui/SmartImage';
import { Button } from '../components/ui/Button';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal';

/** About / mission. Image column has a gentle parallax and a reveal mask. */
export function About() {
  const ref = useRef(null);
  const prefersReduced = usePrefersReducedMotion();
  const { openBooking } = useUI();
  const copy = siteCopy.about;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-4%', prefersReduced ? '-4%' : '8%']);

  return (
    // `relative` matters: framer-motion's useScroll measures against this
    // element and warns if it is statically positioned.
    <section
      id="about"
      ref={ref}
      className="section-padding relative bg-cream-50"
      aria-labelledby="about-heading"
    >
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ── Images ─────────────────────────────────── */}
          <div className="relative order-first lg:order-last">
            <Reveal className="relative overflow-hidden rounded-panel shadow-lift">
              <motion.div style={{ y }} className="h-full w-full">
                <SmartImage
                  src={images.about.src}
                  alt={images.about.alt}
                  ratio="4 / 3"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="scale-[1.08]"
                />
              </motion.div>
            </Reveal>

            {/* Overlapping secondary image — hidden on the smallest screens
                where it would crowd the composition. */}
            <Reveal
              delay={0.15}
              className="absolute -bottom-8 -left-4 hidden w-40 overflow-hidden rounded-card border-4 border-cream-50 shadow-lift sm:block sm:w-48 lg:-left-10 lg:w-56"
            >
              <SmartImage
                src={images.aboutSecondary.src}
                alt={images.aboutSecondary.alt}
                ratio="1 / 1"
                sizes="220px"
              />
            </Reveal>

            {/* Floating stat chip */}
            <Reveal
              delay={0.25}
              className="absolute -right-2 -top-5 rounded-2xl border border-emerald-900/[0.07] bg-cream-50 px-4 py-3 shadow-lift sm:-right-5 sm:px-5 sm:py-4 lg:-right-8"
            >
              <p className="font-display text-fluid-h3 font-semibold text-emerald-800">
                {copy.statValue}
              </p>
              <p className="text-fluid-xs font-medium text-charcoal-500">{copy.statLabel}</p>
            </Reveal>
          </div>

          {/* ── Copy ───────────────────────────────────── */}
          <div className="lg:pr-6">
            <SectionHeading
              id="about-heading"
              align="left"
              eyebrow={copy.eyebrow}
              title={copy.title}
              className="max-w-none"
            />

            <Reveal delay={0.1} className="mt-6 space-y-4 text-fluid-base text-charcoal-500">
              {(copy.paragraphs || []).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </Reveal>

            {/* Values */}
            <RevealGroup className="mt-8 space-y-4" staggerChildren={0.09}>
              {values.map((value) => (
                <RevealItem key={value.title} className="flex gap-4">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400 ring-4 ring-gold-400/15"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <h3 className="text-fluid-h4 font-semibold">{value.title}</h3>
                    <p className="mt-1 text-fluid-sm text-charcoal-500">{value.description}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            {/* Mission pull-quote */}
            <Reveal delay={0.15} className="mt-8 rounded-card border-l-2 border-gold-400 bg-cream-100 p-5">
              <Quote className="h-5 w-5 text-gold-400" aria-hidden="true" />
              <p className="mt-2.5 font-display text-fluid-h4 font-medium leading-relaxed text-emerald-900">
                {copy.quote}
              </p>
            </Reveal>

            <Reveal delay={0.2} className="mt-8">
              <Button size="lg" icon={ArrowRight} onClick={() => openBooking()}>
                {copy.cta}
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
