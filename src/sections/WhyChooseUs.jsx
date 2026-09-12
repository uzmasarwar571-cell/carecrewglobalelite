import { motion } from 'framer-motion';
import { reasons } from '../data/content';
import { businessConfig } from '../config/business';
import { siteCopy } from '../data/copy';
import { usePrefersReducedMotion } from '../hooks';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Counter } from '../components/ui/Counter';
import { RevealGroup, RevealItem, Reveal } from '../components/ui/Reveal';

/**
 * Trust pillars + the animated statistics band.
 * Stats live here rather than in their own section so the numbers land
 * as evidence for the claims immediately above them.
 */
export function WhyChooseUs() {
  const prefersReduced = usePrefersReducedMotion();
  const copy = siteCopy.whyUs;

  return (
    <section id="why-us" className="section-padding bg-cream-100" aria-labelledby="why-heading">
      <div className="container">
        <SectionHeading
          id="why-heading"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <RevealGroup
          className="mt-12 grid grid-cols-1 gap-4 xs:grid-cols-2 lg:mt-16 lg:grid-cols-4"
          staggerChildren={0.055}
        >
          {reasons.map((reason) => (
            <RevealItem key={reason.title}>
              <motion.div
                whileHover={prefersReduced ? undefined : { y: -5 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className="group h-full rounded-card border border-emerald-900/[0.06] bg-cream-50 p-5 transition-shadow duration-500 ease-premium hover:shadow-lift sm:p-6"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-700/[0.07] text-emerald-700 transition-colors duration-500 ease-premium group-hover:bg-emerald-700 group-hover:text-cream-50">
                  <reason.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-fluid-h4 font-semibold">{reason.title}</h3>
                <p className="mt-2 text-fluid-sm text-charcoal-500">{reason.description}</p>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* ── Statistics ─────────────────────────────────── */}
        <Reveal delay={0.1} className="mt-12 lg:mt-16">
          <div className="rounded-panel border border-emerald-900/[0.07] bg-cream-50 px-5 py-9 shadow-soft sm:px-8 sm:py-11">
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4">
              {(businessConfig.stats || []).map((stat, index) => (
                <div key={stat.label} className="relative">
                  {/* Divider on the desktop row only. */}
                  {index > 0 && (
                    <span
                      className="absolute -left-2 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-emerald-900/[0.08] lg:block"
                      aria-hidden="true"
                    />
                  )}
                  <Counter
                    value={stat.value}
                    suffix={stat.suffix}
                    raw={stat.raw}
                    label={stat.label}
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default WhyChooseUs;
