import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { cities } from '../data/cities';
import { useUI } from '../context/UIProvider';
import { usePrefersReducedMotion } from '../hooks';
import { whatsappMessages } from '../config/business';
import { siteCopy } from '../data/copy';
import { openWhatsApp } from '../utils/whatsapp';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { RevealGroup, RevealItem, Reveal } from '../components/ui/Reveal';

/**
 * Cities we serve. Answers "do they cover my area?" — one of the six
 * questions the page has to resolve quickly.
 * Adding a city to data/cities.js is all that is needed to extend this.
 */
export function Cities() {
  const { openBooking } = useUI();
  const copy = siteCopy.cities;

  return (
    <section id="cities" className="section-padding bg-cream-50" aria-labelledby="cities-heading">
      <div className="container">
        <SectionHeading
          id="cities-heading"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <RevealGroup
          className="mt-12 grid grid-cols-1 gap-5 xs:grid-cols-2 lg:mt-16 lg:grid-cols-4"
          staggerChildren={0.08}
        >
          {cities.map((city) => (
            <CityCard key={city.id} city={city} onBook={() => openBooking()} />
          ))}
        </RevealGroup>

        <Reveal delay={0.1} className="mt-10 text-center">
          <p className="text-fluid-base text-charcoal-500">
            {copy.outsidePrefix}{' '}
            <button
              type="button"
              onClick={() => openWhatsApp(whatsappMessages.general)}
              className="font-semibold text-emerald-700 underline decoration-emerald-700/30 underline-offset-4 transition-colors hover:text-emerald-900 hover:decoration-emerald-900"
            >
              {copy.outsideLink}
            </button>{' '}
            {copy.outsideSuffix}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function CityCard({ city, onBook }) {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <RevealItem>
      <motion.article
        whileHover={prefersReduced ? undefined : { y: -6 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-card border border-emerald-900/[0.07] bg-white p-5 shadow-soft transition-shadow duration-500 ease-premium hover:shadow-lift sm:p-6"
      >
        {/* Emerald wash that fills on hover. */}
        <span
          className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-emerald-600 to-gold-400 transition-transform duration-500 ease-premium group-hover:scale-x-100"
          aria-hidden="true"
        />

        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-700/[0.07] text-emerald-700 transition-colors duration-500 ease-premium group-hover:bg-emerald-700 group-hover:text-cream-50">
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </span>

        <h3 className="mt-4 text-fluid-h3 font-semibold">{city.name}</h3>
        <p className="mt-2 text-fluid-sm text-charcoal-500">{city.blurb}</p>

        {/* Areas */}
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {city.areas.slice(0, 4).map((area) => (
            <li
              key={area}
              className="rounded-pill bg-cream-100 px-2.5 py-1 text-[11px] font-medium text-charcoal-500"
            >
              {area}
            </li>
          ))}
          {city.areas.length > 4 && (
            <li className="rounded-pill bg-cream-100 px-2.5 py-1 text-[11px] font-medium text-charcoal-400">
              +{city.areas.length - 4} more
            </li>
          )}
        </ul>

        <div className="mt-6 flex-1" />

        <Button variant="ghost" size="sm" className="-ml-2 self-start" icon={ArrowRight} onClick={onBook}>
          {siteCopy.cities.cardCtaPrefix} {city.name}
        </Button>
      </motion.article>
    </RevealItem>
  );
}

export default Cities;
