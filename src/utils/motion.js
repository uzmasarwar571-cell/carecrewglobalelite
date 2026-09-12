/**
 * Shared Framer Motion variants.
 * Keeping them here means every section animates with the same
 * timing signature, which is most of what makes motion feel designed
 * rather than bolted on.
 */

export const EASE = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

/** Parent that staggers its children into view. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/** Standard viewport config — fires once, slightly before fully visible. */
export const viewportOnce = { once: true, amount: 0.2, margin: '0px 0px -80px 0px' };

/** Modal panel enter/exit. */
export const modalPanel = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: EASE } },
  exit: { opacity: 0, y: 16, scale: 0.985, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const backdrop = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/**
 * Returns variants stripped of movement when the user prefers reduced
 * motion — they still get the content, just without the travel.
 */
export const reduce = (variants, prefersReduced) => {
  if (!prefersReduced) return variants;
  return {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };
};
