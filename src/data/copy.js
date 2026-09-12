/**
 * ─────────────────────────────────────────────────────────────
 *  SITE COPY
 * ─────────────────────────────────────────────────────────────
 *  Every headline, paragraph and button label on the public site.
 *  Extracted out of the components so the admin CMS can edit them
 *  without a developer and without a redeploy.
 *
 *  The values below are the DEFAULTS. `applyCopy()` replaces them
 *  with whatever is stored in Firestore (see src/content/hydrate.js).
 *  Because `siteCopy` is an ES `let` export, every component that
 *  imported it sees the new object — no prop drilling required.
 * ─────────────────────────────────────────────────────────────
 */

import { deepMerge } from '../utils/deepMerge';

export const defaultCopy = {
  hero: {
    badge: 'Screened & Verified Staff',
    ratingText: 'Trusted by families across Pakistan',
    titleLead: 'Trusted Maid & Domestic Staff Services in',
    titleHighlight: 'Pakistan',
    subtitle:
      'Find reliable, professional and carefully screened domestic staff for your home or workplace — full-time, part-time, live-in or live-out.',
    trustPoints: ['Verified Staff', 'Flexible Packages', 'Professional Service'],
    ctaPrimary: 'Book a Maid',
    ctaSecondary: 'Explore Services',
    ctaWhatsapp: 'WhatsApp',
    citiesLinePrefix: 'Serving',
    citiesLineSuffix: 'Islamabad · Rawalpindi · Lahore · Karachi',
    card: {
      title: 'How we vet staff',
      subtitle: 'Before anyone reaches your door',
      items: [
        'In-person interview and suitability check',
        'CNIC and contact details verified',
        'Previous household experience confirmed',
        'Briefed on conduct, privacy and punctuality',
      ],
      cta: 'Ask us a question',
      note: 'Typically replies the same day',
    },
  },

  services: {
    eyebrow: 'What we provide',
    title: 'Domestic staff for every part of running a home',
    description:
      'From daily household help to specialised care, we match you with staff whose experience actually fits what you need.',
    ctaTitle: 'Not sure which service you need?',
    ctaDescription:
      'Tell us how your household runs and we will suggest the right kind of help — no obligation to book.',
    ctaPrimary: 'Request Staff',
    ctaSecondary: 'Talk to Our Team',
    cardLink: 'Learn more',
  },

  howItWorks: {
    eyebrow: 'How it works',
    title: 'Hiring help should not be complicated',
    description: 'Four straightforward steps from your first message to reliable help at home.',
    cta: 'Get Started',
    note: 'Takes about a minute — no payment required to enquire.',
  },

  about: {
    eyebrow: 'About Care Crew Maid',
    title: "More than domestic help. It's care you can trust.",
    paragraphs: [
      'Care Crew Maid connects families and businesses across Pakistan with professional domestic staff. We started because hiring household help usually means relying on word of mouth and hoping for the best — with no way to check who you are letting into your home.',
      'We do that checking for you. Every person we recommend has been interviewed, identity-verified and briefed on how to work respectfully inside a family home. And we stay reachable afterwards, because a placement is the beginning of the relationship, not the end of it.',
    ],
    quote:
      'We would rather tell you a match will take an extra week than send someone we would not welcome into our own home.',
    cta: 'Find Staff',
    statValue: '4+',
    statLabel: 'Cities covered',
  },

  whyUs: {
    eyebrow: 'Why Care Crew',
    title: 'Reasons families keep coming back',
    description:
      'The difference is not in what we promise — it is in what we check before anyone starts.',
  },

  staff: {
    eyebrow: 'Available professionals',
    title: 'Some of the people we can match you with',
    description:
      'A sample of the staff currently on our list. Availability changes daily — message us for current options in your area.',
    cta: 'Request a Match',
    disclaimer:
      'Profiles shown are examples of the roles we place. Full details, including verified identity documents, are shared with you before you confirm anyone.',
    cardCta: 'View Profile',
  },

  trust: {
    eyebrow: 'Trust & verification',
    title: 'Your home deserves trusted care.',
    description:
      'The hardest part of hiring domestic help is not finding someone — it is knowing whether you can trust them. Here is exactly what we do before we recommend anyone.',
    ctaPrimary: 'Book a Maid',
    ctaSecondary: 'Ask About Screening',
    note: 'We describe only the checks we actually carry out. If a service promises official police clearance for domestic staff, ask them to show you the documentation.',
  },

  testimonials: {
    eyebrow: 'Customer stories',
    title: 'What families tell us afterwards',
    description:
      'Placeholder reviews shown while we collect and publish verified customer feedback.',
  },

  cities: {
    eyebrow: 'Coverage',
    title: 'Serving families across Pakistan',
    description:
      'Staff available in the main residential areas of four major cities — with more being added.',
    outsidePrefix: 'Outside these cities?',
    outsideLink: 'Message us anyway',
    outsideSuffix: '— we may still be able to help.',
    cardCtaPrefix: 'Find Staff in',
  },

  faq: {
    eyebrow: 'Questions',
    title: 'Answers before you ask',
    description: 'The things families most often want to know before hiring domestic help.',
    helpTitle: 'Still have a question?',
    helpText: 'Message us on WhatsApp — we usually reply the same day.',
    ctaWhatsapp: 'WhatsApp Us',
    ctaBook: 'Book a Maid',
  },

  cta: {
    title: 'Ready for reliable help at home?',
    description:
      'Tell us what you need and we will come back with staff who actually fit — usually the same day you ask.',
    primary: 'Book a Maid',
    whatsapp: 'WhatsApp Us',
    callback: 'Request a Callback',
    note: 'No payment required to enquire · No obligation to hire',
  },

  contact: {
    eyebrow: 'Get in touch',
    title: 'Talk to the Care Crew team',
    description: 'Whichever way suits you — a call, a WhatsApp message, or let us call you back.',
    callLabel: 'Call us',
    whatsappLabel: 'WhatsApp',
    emailLabel: 'Email',
    emailNote: 'Replies within one working day',
    hoursTitle: 'Working hours',
    areasTitle: 'Service areas',
    areasNote: 'Plus surrounding residential areas — ask about yours.',
    callbackTitle: 'Prefer we call you?',
    callbackText:
      'Leave your number and a good time. No sales calls — just a conversation about what you need.',
    callbackCta: 'Request a Callback',
    bookCta: 'Book a Maid',
  },
};

/** Live binding — reassigned by applyCopy(), read by every section. */
export let siteCopy = defaultCopy;

/**
 * Merges stored copy over the defaults. Merging (rather than replacing)
 * means a partially-filled Firestore document can never blank out a
 * heading that the owner has not touched.
 */
export function applyCopy(stored) {
  siteCopy = stored ? deepMerge(defaultCopy, stored) : defaultCopy;
  return siteCopy;
}

export default defaultCopy;
