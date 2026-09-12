import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, MessageCircle, Check, ShieldCheck, Star } from 'lucide-react';
import { useUI } from '../context/UIProvider';
import { usePrefersReducedMotion } from '../hooks';
import { images } from '../config/images';
import { businessConfig, whatsappMessages } from '../config/business';
import { siteCopy } from '../data/copy';
import { openWhatsApp } from '../utils/whatsapp';
import { scrollToSection } from '../components/layout/navLinks';
import { Button } from '../components/ui/Button';
import { SmartImage } from '../components/ui/SmartImage';
import { EASE } from '../utils/motion';

/**
 * Hero. Answers "what is this and can I trust it" above the fold, and
 * puts both conversion paths (book / WhatsApp) within one tap.
 *
 * Layout: stacked on phones, split at lg. The image column carries a
 * slow parallax that is dropped for reduced-motion visitors.
 */
export function Hero() {
  const sectionRef = useRef(null);
  const prefersReduced = usePrefersReducedMotion();
  const { openBooking } = useUI();
  const copy = siteCopy.hero;
  const trustPoints = copy.trustPoints || [];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '12%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '-6%']);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
  };
  const item = prefersReduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }
    : {
        hidden: { opacity: 0, y: 26 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
      };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-emerald-950"
      aria-labelledby="hero-heading"
    >
      {/* ── Background ─────────────────────────────────── */}
      <div className="absolute inset-0 -z-20">
        <motion.div style={{ y: imageY }} className="h-[112%] w-full">
          <SmartImage
            src={images.hero.src}
            alt={images.hero.alt}
            priority
            ratio="auto"
            sizes="100vw"
            className="h-full w-full"
            imgClassName="h-full w-full"
          />
        </motion.div>
      </div>

      {/* Tint + gradient so text stays legible over any replacement photo. */}
      <div
        className="absolute inset-0 -z-10 bg-emerald-950/80 lg:bg-gradient-to-r lg:from-emerald-950/95 lg:via-emerald-950/85 lg:to-emerald-950/45"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(75% 55% at 12% 18%, rgba(44,125,99,0.30) 0%, rgba(6,26,22,0) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="bg-grain absolute inset-0 -z-10 opacity-[0.14] mix-blend-overlay" aria-hidden="true" />

      {/* ── Content ────────────────────────────────────── */}
      <div
        className="container relative grid items-center gap-10 lg:grid-cols-12 lg:gap-8"
        style={{ paddingTop: 'calc(var(--nav-height) + clamp(2.5rem, 6vw, 5rem))' }}
      >
        <motion.div
          style={{ y: contentY }}
          variants={container}
          initial="hidden"
          animate="show"
          className="pb-14 lg:col-span-7 lg:pb-28 xl:col-span-6"
        >
          {/* Eyebrow */}
          <motion.div variants={item} className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-pill border border-gold-300/25 bg-gold-300/[0.08] px-3.5 py-1.5 text-fluid-xs font-semibold text-gold-200">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.badge}
            </span>
            <span className="inline-flex items-center gap-1.5 text-fluid-xs font-medium text-cream-200/65">
              <span className="flex" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold-300 text-gold-300" />
                ))}
              </span>
              {copy.ratingText}
            </span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            variants={item}
            className="max-w-[15ch] text-fluid-h1 font-semibold text-cream-50"
          >
            {copy.titleLead}{' '}
            <span className="relative whitespace-nowrap text-gold-300">
              {copy.titleHighlight}
              <svg
                className="absolute -bottom-1 left-0 h-[0.28em] w-full text-gold-400/50"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  d="M2 8.5C40 3.5 92 2.5 198 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: prefersReduced ? 0 : 1.1, delay: 0.8, ease: EASE }}
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-fluid-lead text-cream-200/75"
          >
            {copy.subtitle}
          </motion.p>

          {/* Trust ticks */}
          <motion.ul variants={item} className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 text-fluid-sm text-cream-100/85">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/20">
                  <Check className="h-3 w-3 text-gold-300" strokeWidth={3} aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </motion.ul>

          {/* CTAs */}
          <motion.div variants={item} className="mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <Button size="lg" variant="gold" icon={ArrowRight} onClick={() => openBooking()}>
              {copy.ctaPrimary}
            </Button>
            <Button
              size="lg"
              variant="onDark"
              onClick={() => scrollToSection('services')}
            >
              {copy.ctaSecondary}
            </Button>
            <Button
              size="lg"
              variant="ghostLight"
              className="hidden sm:inline-flex"
              icon={MessageCircle}
              iconPosition="left"
              onClick={() => openWhatsApp(whatsappMessages.general)}
            >
              {copy.ctaWhatsapp}
            </Button>
          </motion.div>

          {/* Cities line */}
          <motion.p variants={item} className="mt-8 text-fluid-xs text-cream-200/45">
            {copy.citiesLinePrefix}{' '}
            <span className="text-cream-200/70">
              {businessConfig.stats?.[2]?.value ?? ''} major cities
            </span>{' '}
            — {copy.citiesLineSuffix}
          </motion.p>
        </motion.div>

        {/* ── Floating proof card (desktop) ──────────────── */}
        <div className="relative hidden lg:col-span-5 lg:block xl:col-span-6">
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            className="ml-auto w-full max-w-sm xl:max-w-md"
          >
            <div className="relative overflow-hidden rounded-panel border border-cream-50/12 bg-cream-50/[0.07] p-6 shadow-glass backdrop-blur-xl xl:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-300/15 text-gold-300">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-fluid-h4 font-semibold text-cream-50">
                    {copy.card?.title}
                  </p>
                  <p className="text-fluid-xs text-cream-200/55">{copy.card?.subtitle}</p>
                </div>
              </div>

              <ul className="mt-6 space-y-3.5">
                {(copy.card?.items || []).map((line, index) => (
                  <motion.li
                    key={line}
                    initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.75 + index * 0.1, ease: EASE }}
                    className="flex items-start gap-3 text-fluid-sm text-cream-100/85"
                  >
                    <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-emerald-500/25">
                      <Check className="h-2.5 w-2.5 text-gold-200" strokeWidth={3.5} aria-hidden="true" />
                    </span>
                    {line}
                  </motion.li>
                ))}
              </ul>

              <div className="mt-6 border-t border-cream-50/10 pt-5">
                <Button
                  size="md"
                  variant="whatsapp"
                  fullWidth
                  icon={MessageCircle}
                  iconPosition="left"
                  onClick={() => openWhatsApp(whatsappMessages.general)}
                >
                  {copy.card?.cta}
                </Button>
                <p className="mt-3 text-center text-fluid-xs text-cream-200/45">
                  {copy.card?.note}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Soft transition into the next section. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-cream-50"
        aria-hidden="true"
      />
    </section>
  );
}

export default Hero;
