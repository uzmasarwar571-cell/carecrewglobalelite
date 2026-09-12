/**
 * ─────────────────────────────────────────────────────────────
 *  SITE SETTINGS
 * ─────────────────────────────────────────────────────────────
 *  Behavioural switches rather than content: which sections are
 *  visible, whether the popups run, SEO metadata, and the copy
 *  used inside the two conversion popups.
 *
 *  Managed from the admin panel under Settings.
 * ─────────────────────────────────────────────────────────────
 */

import { deepMerge } from '../utils/deepMerge';

/**
 * Section visibility. The key matches the section's DOM id where
 * one exists, so navigation links can be filtered by the same flag.
 */
export const sectionKeys = [
  { key: 'trustBar', label: 'Trust strip', note: 'Thin badge row under the hero.' },
  { key: 'services', label: 'Services' },
  { key: 'howItWorks', label: 'How it works' },
  { key: 'about', label: 'About' },
  { key: 'whyUs', label: 'Why choose us', note: 'Includes the statistics band.' },
  { key: 'staff', label: 'Available staff' },
  { key: 'trust', label: 'Trust & verification' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'cities', label: 'Cities covered' },
  { key: 'faqs', label: 'FAQs' },
  { key: 'ctaBand', label: 'Closing CTA band' },
  { key: 'contact', label: 'Contact' },
];

export const defaultSettings = {
  sections: Object.fromEntries(sectionKeys.map(({ key }) => [key, true])),

  popups: {
    welcome: {
      enabled: true,
      /** Milliseconds before it may appear. */
      delay: 9000,
      /** Pixels the visitor must scroll first, so it never covers the hero. */
      afterScroll: 600,
      badge: 'Care Crew',
      title: 'Looking for a reliable maid?',
      body: 'Tell us what you need and we will come back with staff who fit — usually the same day.',
      primaryCta: 'Book a Maid',
      whatsappCta: 'WhatsApp Us',
      dismissLabel: 'Not right now',
    },
    exitIntent: {
      enabled: true,
      /** Milliseconds on the page before exit intent is armed. */
      delay: 15000,
      title: 'Still looking for domestic help?',
      body: 'Send us your requirements before you go — there is no cost to enquire, and no obligation to hire anyone we suggest.',
      primaryCta: 'Talk to Care Crew',
      whatsappCta: 'WhatsApp',
      callbackCta: 'Call me back',
      dismissLabel: 'No thanks, just browsing',
    },
  },

  features: {
    /** The bespoke cursor ring — desktop only either way. */
    customCursor: true,
    /** The floating WhatsApp bubble. */
    floatingWhatsApp: true,
    /** The sticky call/WhatsApp/book bar on phones. */
    mobileActionBar: true,
    /** The opening logo animation. */
    preloader: true,
  },

  seo: {
    title: 'Care Crew Maid | Trusted Maid & Domestic Staff Services in Pakistan',
    description:
      'Care Crew Maid provides professional maid, nanny, cooking, cleaning, elderly care and domestic staff services across Pakistan. Verified staff in Islamabad, Rawalpindi, Lahore and Karachi.',
    keywords:
      'maid service Pakistan, domestic staff Islamabad, house maid Lahore, nanny Karachi, cook Rawalpindi, elderly care Pakistan, part time maid, full time maid',
    ogImage: '/og-image.jpg',
    /** Set false to add `noindex` while the site is in progress. */
    indexable: true,
  },

  /** Where booking and callback submissions are written. */
  leads: {
    /** Keep a localStorage copy as a safety net. */
    localBackup: true,
  },
};

/* ── Live binding ──────────────────────────────────────────── */

export let settings = defaultSettings;

export function applySettings(stored) {
  settings = stored ? deepMerge(defaultSettings, stored) : defaultSettings;
  return settings;
}

/** Convenience: is this section switched on? Unknown keys default to visible. */
export const isSectionVisible = (key) => settings.sections?.[key] !== false;

export default settings;
