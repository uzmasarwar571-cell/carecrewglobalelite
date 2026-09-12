import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, MessageCircle } from 'lucide-react';
import { services } from '../data/services';
import { useUI } from '../context/UIProvider';
import { usePrefersReducedMotion } from '../hooks';
import { whatsappMessages } from '../config/business';
import { siteCopy } from '../data/copy';
import { openWhatsApp } from '../utils/whatsapp';
import { SectionHeading } from '../components/ui/SectionHeading';
import { SmartImage } from '../components/ui/SmartImage';
import { Button } from '../components/ui/Button';
import { RevealGroup, RevealItem, Reveal } from '../components/ui/Reveal';

/**
 * Services grid. Each card opens a detail modal; the modal's CTA
 * hands the selected service straight to the booking form.
 */
export function Services() {
  const { openServiceDetail, openBooking } = useUI();
  const copy = siteCopy.services;

  return (
    <section id="services" className="section-padding relative bg-cream-50" aria-labelledby="services-heading">
      <div className="container">
        <SectionHeading
          id="services-heading"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <RevealGroup
          className="mt-12 grid grid-cols-1 gap-5 xs:grid-cols-2 lg:mt-16 lg:grid-cols-3 xl:grid-cols-4"
          staggerChildren={0.06}
        >
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} onOpen={() => openServiceDetail(service)} />
          ))}
        </RevealGroup>

        {/* Section CTA */}
        <Reveal delay={0.1} className="mt-12">
          <div className="relative overflow-hidden rounded-panel border border-emerald-900/[0.08] bg-gradient-to-br from-emerald-50 to-cream-100 p-6 sm:p-8">
            <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h3 className="text-fluid-h3 font-semibold">{copy.ctaTitle}</h3>
                <p className="mt-2 text-fluid-base text-charcoal-500">{copy.ctaDescription}</p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-3 xs:flex-row md:w-auto">
                <Button icon={ArrowRight} onClick={() => openBooking()}>
                  {copy.ctaPrimary}
                </Button>
                <Button
                  variant="outline"
                  icon={MessageCircle}
                  iconPosition="left"
                  onClick={() => openWhatsApp(whatsappMessages.general)}
                >
                  {copy.ctaSecondary}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ServiceCard({ service, onOpen }) {
  const prefersReduced = usePrefersReducedMotion();
  const Icon = service.icon;

  return (
    <RevealItem>
      <motion.button
        type="button"
        onClick={onOpen}
        whileHover={prefersReduced ? undefined : { y: -6 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        aria-label={`${service.name} — view details`}
        className="group relative flex h-full w-full flex-col overflow-hidden rounded-card border border-emerald-900/[0.07] bg-white text-left shadow-soft transition-shadow duration-500 ease-premium hover:shadow-lift"
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          <SmartImage
            src={service.image}
            alt=""
            ratio="16 / 10"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 380px) 50vw, 100vw"
            imgClassName="transition-transform duration-[900ms] ease-premium group-hover:scale-[1.07]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-emerald-950/55 via-emerald-950/5 to-transparent"
            aria-hidden="true"
          />

          {/* Icon badge */}
          <span className="absolute bottom-3 left-3 grid h-11 w-11 place-items-center rounded-full bg-cream-50/95 text-emerald-700 shadow-soft backdrop-blur-sm transition-all duration-500 ease-premium group-hover:bg-emerald-700 group-hover:text-cream-50">
            <Icon
              className="h-5 w-5 transition-transform duration-500 ease-premium group-hover:scale-110"
              aria-hidden="true"
            />
          </span>

          {/* Corner affordance */}
          <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream-50/90 text-emerald-800 opacity-0 shadow-soft backdrop-blur-sm transition-all duration-300 ease-premium group-hover:opacity-100 group-focus-visible:opacity-100">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-fluid-h4 font-semibold transition-colors duration-300 group-hover:text-emerald-700">
            {service.name}
          </h3>
          <p className="mt-2 flex-1 text-fluid-sm text-charcoal-500">{service.summary}</p>

          <span className="mt-4 inline-flex items-center gap-1.5 text-fluid-sm font-semibold text-emerald-700">
            {siteCopy.services.cardLink}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>

        {/* Accent line that draws in on hover */}
        <span
          className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-gold-400 transition-transform duration-500 ease-premium group-hover:scale-x-100 group-focus-visible:scale-x-100"
          aria-hidden="true"
        />
      </motion.button>
    </RevealItem>
  );
}

export default Services;
