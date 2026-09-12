import { resolveIcon } from '../lib/icons';

/**
 * Repeatable content blocks: the process steps, trust pillars,
 * verification checklist, hero trust strip and About values.
 *
 * Like the service catalogue, icons are stored as names so these
 * arrays round-trip through Firestore unchanged.
 */

/** "How It Works" — the 4-step process. */
export const defaultSteps = [
  {
    id: 'step-1',
    number: '01',
    title: 'Tell Us What You Need',
    description:
      'Share the type of help you are looking for, your city and your preferred timings. It takes about a minute.',
    iconName: 'ClipboardList',
    order: 0,
  },
  {
    id: 'step-2',
    number: '02',
    title: 'We Match You',
    description:
      'Our team shortlists staff whose experience and availability actually fit your household requirements.',
    iconName: 'UserSearch',
    order: 1,
  },
  {
    id: 'step-3',
    number: '03',
    title: 'Meet & Confirm',
    description:
      'Meet the candidate, ask your questions, and only confirm once you are genuinely comfortable.',
    iconName: 'MessageSquareHeart',
    order: 2,
  },
  {
    id: 'step-4',
    number: '04',
    title: 'Enjoy Reliable Help',
    description:
      'Your staff member begins work, and we stay available for any support you need afterwards.',
    iconName: 'Home',
    order: 3,
  },
];

/** "Why Choose Care Crew Maid" — trust pillars. */
export const defaultReasons = [
  {
    id: 'reason-1',
    title: 'Verified Staff',
    description: 'Identity documents checked and work history confirmed before we recommend anyone.',
    iconName: 'ShieldCheck',
    order: 0,
  },
  {
    id: 'reason-2',
    title: 'Experienced Professionals',
    description: 'Candidates with real household experience, not first-time workers sent untrained.',
    iconName: 'BadgeCheck',
    order: 1,
  },
  {
    id: 'reason-3',
    title: 'Flexible Service',
    description: 'Full-time, part-time, live-in or live-out — arranged around how your home runs.',
    iconName: 'CalendarClock',
    order: 2,
  },
  {
    id: 'reason-4',
    title: 'Transparent Process',
    description: 'Clear terms discussed upfront. No hidden charges added later.',
    iconName: 'Eye',
    order: 3,
  },
  {
    id: 'reason-5',
    title: 'Family-Friendly',
    description: 'Staff briefed on respectful conduct in family homes and with children and elders.',
    iconName: 'Users',
    order: 4,
  },
  {
    id: 'reason-6',
    title: 'Quick Response',
    description: 'Most WhatsApp enquiries are answered the same day, seven days a week.',
    iconName: 'Zap',
    order: 5,
  },
  {
    id: 'reason-7',
    title: 'Ongoing Support',
    description: 'We stay reachable after placement, not only until the booking is confirmed.',
    iconName: 'Headphones',
    order: 6,
  },
  {
    id: 'reason-8',
    title: 'City-Wide Availability',
    description: 'Coverage across the main residential areas of four major cities.',
    iconName: 'MapPin',
    order: 7,
  },
];

/**
 * Trust & verification section.
 * NOTE: worded carefully to avoid legally sensitive claims. Do not
 * add "police verified" or similar unless you genuinely carry out
 * and can evidence that process.
 */
export const defaultVerificationSteps = [
  {
    id: 'verify-1',
    title: 'Staff Screening',
    description:
      'Every candidate is interviewed in person before being added to our list. We assess conduct, communication and suitability for household work.',
    iconName: 'FileSearch',
    order: 0,
  },
  {
    id: 'verify-2',
    title: 'Identity Verification',
    description:
      'We record and verify CNIC details and contact information for every staff member we place, and share them with you at confirmation.',
    iconName: 'IdCard',
    order: 1,
  },
  {
    id: 'verify-3',
    title: 'Experience Checks',
    description:
      'We confirm previous household experience and, where available, speak to former employers before recommending a candidate.',
    iconName: 'Briefcase',
    order: 2,
  },
  {
    id: 'verify-4',
    title: 'Professional Conduct',
    description:
      'Staff are briefed on punctuality, privacy, respectful behaviour and the expectations of working inside a family home.',
    iconName: 'Handshake',
    order: 3,
  },
  {
    id: 'verify-5',
    title: 'Customer Support',
    description:
      'A point of contact you can reach after placement if anything needs to be adjusted or discussed.',
    iconName: 'LifeBuoy',
    order: 4,
  },
  {
    id: 'verify-6',
    title: 'Replacement Assistance',
    description:
      'If a placement is not working out, tell us. We will help you arrange a suitable replacement.',
    iconName: 'RefreshCw',
    order: 5,
  },
];

/** Small trust strip that sits directly under the hero. */
export const defaultTrustBadges = [
  { id: 'badge-1', label: 'Identity Verified Staff', iconName: 'ShieldCheck', order: 0 },
  { id: 'badge-2', label: 'Experience Checked', iconName: 'BadgeCheck', order: 1 },
  { id: 'badge-3', label: 'Flexible Packages', iconName: 'CalendarClock', order: 2 },
  { id: 'badge-4', label: 'Replacement Support', iconName: 'RefreshCw', order: 3 },
];

/** About section values. */
export const defaultValues = [
  {
    id: 'value-1',
    title: 'Trust First',
    description:
      'We would rather tell you a match will take longer than send someone we would not welcome into our own home.',
    order: 0,
  },
  {
    id: 'value-2',
    title: 'Honest Communication',
    description:
      'Clear terms, realistic timelines and straight answers — before you commit, not after.',
    order: 1,
  },
  {
    id: 'value-3',
    title: 'Respect for Everyone',
    description:
      'Fair treatment for the families we serve and for the staff we place. Both sides matter.',
    order: 2,
  },
];

const withIcon = (item) => ({ ...item, icon: resolveIcon(item.iconName) });
const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

/* ── Live bindings ─────────────────────────────────────────── */

export let steps = defaultSteps.map(withIcon);
export let reasons = defaultReasons.map(withIcon);
export let verificationSteps = defaultVerificationSteps.map(withIcon);
export let trustBadges = defaultTrustBadges.map(withIcon);
export let values = [...defaultValues];

/**
 * Replaces the blocks with what the CMS has stored.
 * Any key that is missing or empty falls back to the bundled default,
 * so a half-seeded database still renders a complete page.
 */
export function applyBlocks(stored = {}) {
  const pick = (list, fallback) =>
    (Array.isArray(list) && list.length ? list : fallback).slice().sort(byOrder);

  steps = pick(stored.steps, defaultSteps).map(withIcon);
  reasons = pick(stored.reasons, defaultReasons).map(withIcon);
  verificationSteps = pick(stored.verificationSteps, defaultVerificationSteps).map(withIcon);
  trustBadges = pick(stored.trustBadges, defaultTrustBadges).map(withIcon);
  values = pick(stored.values, defaultValues);

  return { steps, reasons, verificationSteps, trustBadges, values };
}

/** The shape the CMS reads and writes — icons as names, no components. */
export const defaultBlocks = {
  steps: defaultSteps,
  reasons: defaultReasons,
  verificationSteps: defaultVerificationSteps,
  trustBadges: defaultTrustBadges,
  values: defaultValues,
};
