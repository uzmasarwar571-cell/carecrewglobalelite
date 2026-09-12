/**
 * ─────────────────────────────────────────────────────────────
 *  CENTRAL IMAGE CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 *  Every photograph on the site is referenced from here.
 *
 *  Once Firebase is connected, the admin panel's Media library
 *  becomes the easiest way to change these — upload a file and
 *  assign it to a slot. `applyImages()` then swaps the URLs in at
 *  boot without touching a component.
 *
 *  Note on people: we deliberately do NOT use stock photos of
 *  models posing as domestic staff — it reads as fake and it
 *  misrepresents your team. Staff cards use elegant generated
 *  monograms until you add real, consented photos.
 * ─────────────────────────────────────────────────────────────
 */

import { deepMerge } from '../utils/deepMerge';

/** Builds a responsive, compressed Unsplash URL. */
const unsplash = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`;

export const defaultImages = {
  hero: {
    src: unsplash('1618221195710-dd6b41faaea6', 1400),
    alt: 'Warm, well-kept modern living room with natural light',
  },
  heroSecondary: {
    src: unsplash('1600566753086-00f18fb6b3ea', 900),
    alt: 'Bright, tidy family home interior',
  },
  about: {
    src: unsplash('1616486338812-3dadae4b4ace', 1100),
    alt: 'Neatly arranged and freshly cleaned family living space',
  },
  aboutSecondary: {
    src: unsplash('1615875605825-5eb9bb5d52ac', 800),
    alt: 'Organised shelving and tidy home details',
  },
  trust: {
    src: unsplash('1600607687939-ce8a6c25118c', 1100),
    alt: 'Open-plan kitchen and living area kept spotless',
  },
  cities: {
    src: unsplash('1516156008625-3a9d6067fab5', 1200),
    alt: 'Residential neighbourhood from above',
  },
  services: {
    fullTime: unsplash('1600566753086-00f18fb6b3ea', 700),
    partTime: unsplash('1527515637462-cff94eecc1ac', 700),
    cooking: unsplash('1600607687939-ce8a6c25118c', 700),
    cleaning: unsplash('1584622650111-993a426fbf0a', 700),
    babysitter: unsplash('1616486338812-3dadae4b4ace', 700),
    elderly: unsplash('1618221195710-dd6b41faaea6', 700),
    driver: unsplash('1600585154340-be6161a56a0c', 700),
    office: unsplash('1615875605825-5eb9bb5d52ac', 700),
  },
};

/** Labels for the admin panel's image-slot editor. */
export const imageSlots = [
  { key: 'hero', label: 'Hero background', hint: 'Full-bleed, heavily tinted. 1400px wide or more.' },
  { key: 'heroSecondary', label: 'Hero secondary', hint: 'Currently unused — reserved for layout variants.' },
  { key: 'about', label: 'About — main', hint: 'Shown at 4:3 in the About section.' },
  { key: 'aboutSecondary', label: 'About — inset', hint: 'Small square overlapping the main image.' },
  { key: 'trust', label: 'Trust section background', hint: 'Tinted to ~7% opacity, so composition matters more than detail.' },
  { key: 'cities', label: 'Cities', hint: 'Reserved for the coverage section.' },
];

/* ── Live binding ──────────────────────────────────────────── */

export let images = defaultImages;

export function applyImages(stored) {
  images = stored ? deepMerge(defaultImages, stored) : defaultImages;
  return images;
}

export default images;
