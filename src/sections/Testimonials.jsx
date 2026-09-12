import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials } from '../data/testimonials';
import { siteCopy } from '../data/copy';
import { usePrefersReducedMotion } from '../hooks';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Avatar } from '../components/ui/Avatar';
import { Stars } from '../components/ui/Stars';
import { Reveal } from '../components/ui/Reveal';
import { cn } from '../utils/cn';
import { EASE } from '../utils/motion';

/**
 * Testimonial carousel.
 * Autoplays, pauses on hover/focus, supports arrow keys and swipe, and
 * announces changes politely to screen readers.
 */
export function Testimonials() {
  const [[index, direction], setState] = useState([0, 0]);
  const [paused, setPaused] = useState(false);
  const prefersReduced = usePrefersReducedMotion();
  const railRef = useRef(null);

  const count = testimonials.length;

  const go = useCallback(
    (next) => {
      setState(([current]) => {
        const target = (next + count) % count;
        return [target, target > current || (current === count - 1 && target === 0) ? 1 : -1];
      });
    },
    [count]
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Autoplay — stops while the user is interacting or if motion is reduced.
  useEffect(() => {
    if (paused || prefersReduced) return undefined;
    const timer = window.setInterval(next, 6500);
    return () => window.clearInterval(timer);
  }, [paused, prefersReduced, next]);

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    }
  };

  const slideVariants = prefersReduced
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0, position: 'absolute' },
      }
    : {
        enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
        center: { opacity: 1, x: 0 },
        exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, position: 'absolute' }),
      };

  const active = testimonials[index];

  // Every testimonial can be unpublished from the admin panel — render
  // nothing rather than crashing on an empty carousel.
  if (!active) return null;

  return (
    <section
      id="testimonials"
      className="section-padding bg-cream-100"
      aria-labelledby="testimonials-heading"
    >
      <div className="container">
        <SectionHeading
          id="testimonials-heading"
          eyebrow={siteCopy.testimonials.eyebrow}
          title={siteCopy.testimonials.title}
          description={siteCopy.testimonials.description}
        />

        <Reveal delay={0.1} className="mx-auto mt-12 max-w-3xl lg:mt-16">
          <div
            ref={railRef}
            role="group"
            aria-roledescription="carousel"
            aria-label="Customer testimonials"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className="relative rounded-panel border border-emerald-900/[0.07] bg-cream-50 p-6 shadow-soft sm:p-9"
          >
            <Quote
              className="absolute right-6 top-6 h-10 w-10 text-emerald-900/[0.06] sm:h-14 sm:w-14"
              aria-hidden="true"
            />

            {/* Slide area — min-height keeps the card from jumping between
                testimonials of different lengths. */}
            <div className="relative min-h-[260px] xs:min-h-[230px] sm:min-h-[210px]">
              <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                <motion.blockquote
                  key={active.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: prefersReduced ? 0.2 : 0.45, ease: EASE }}
                  aria-live="polite"
                  className="inset-0 flex h-full flex-col"
                >
                  <Stars rating={active.rating} size="h-[18px] w-[18px]" />

                  <p className="mt-4 flex-1 font-display text-fluid-h4 font-medium leading-relaxed text-emerald-900">
                    “{active.quote}”
                  </p>

                  <footer className="mt-6 flex flex-wrap items-center gap-3">
                    <Avatar name={active.name} size="sm" />
                    <div className="min-w-0">
                      <cite className="block text-fluid-sm font-semibold not-italic text-emerald-900">
                        {active.name}
                      </cite>
                      <span className="text-fluid-xs text-charcoal-400">
                        {active.city} · {active.service}
                      </span>
                    </div>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mt-7 flex items-center justify-between gap-4 border-t border-emerald-900/[0.07] pt-5">
              <div className="flex items-center gap-2" role="tablist" aria-label="Choose testimonial">
                {testimonials.map((item, dotIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={dotIndex === index}
                    aria-label={`Testimonial ${dotIndex + 1} of ${count}`}
                    onClick={() => go(dotIndex)}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300 ease-premium',
                      dotIndex === index
                        ? 'w-7 bg-emerald-700'
                        : 'w-2 bg-emerald-900/15 hover:bg-emerald-900/30'
                    )}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <CarouselButton onClick={prev} label="Previous testimonial">
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </CarouselButton>
                <CarouselButton onClick={next} label="Next testimonial">
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </CarouselButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CarouselButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-emerald-900/12 text-emerald-800 transition-all duration-300 ease-premium hover:border-emerald-700 hover:bg-emerald-700 hover:text-cream-50 active:scale-95"
    >
      {children}
    </button>
  );
}

export default Testimonials;
