/**
 * ─────────────────────────────────────────────────────────────
 *  CARE CREW MAID — CENTRAL BUSINESS CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 *  Contact details, hours, stats and social links for the whole
 *  site. Nothing below is hardcoded anywhere else.
 *
 *  These are the DEFAULTS. Once Firebase is connected, the admin
 *  panel (Settings → Business) becomes the source of truth and
 *  `applyBusiness()` swaps these values in at boot.
 * ─────────────────────────────────────────────────────────────
 */

import { deepMerge } from '../utils/deepMerge';

export const defaultBusinessConfig = {
  name: 'Care Crew Maid',
  shortName: 'Care Crew',
  tagline: 'Reliable domestic staff, matched to your needs.',
  description:
    'Care Crew Maid connects families and businesses across Pakistan with professional, carefully screened domestic staff.',

  // ── Contact ───────────────────────────────────────────────
  // `phone` is what customers see. `phoneDial` is used in tel: links.
  phone: '+92 347 5133101',
  phoneDial: '+923475133101',

  // WhatsApp number in international format WITHOUT + or spaces.
  whatsapp: '923475133101',

  email: 'carecrewmaidsagency@gmail.com',

  // ── Hours ─────────────────────────────────────────────────
  hours: [
    { days: 'Monday – Saturday', time: '9:00 AM – 9:00 PM' },
    { days: 'Sunday', time: '11:00 AM – 7:00 PM' },
  ],
  // Shown next to the phone number as a support promise.
  supportNote: 'WhatsApp enquiries answered 7 days a week',

  // ── Location ──────────────────────────────────────────────
  // Used for LocalBusiness structured data.
  address: {
    street: '',
    locality: 'Islamabad',
    region: 'Islamabad Capital Territory',
    postalCode: '',
    country: 'PK',
  },

  // ── Web ───────────────────────────────────────────────────
  siteUrl: 'https://carecrewmaid.com',

  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    linkedin: '',
  },

  // ── Headline statistics ───────────────────────────────────
  // Replace with your real numbers, or delete any entry you
  // cannot substantiate.
  stats: [
    { value: 500, suffix: '+', label: 'Families Served' },
    { value: 1000, suffix: '+', label: 'Successful Placements' },
    { value: 4, suffix: '', label: 'Major Cities' },
    { value: 24, suffix: '/7', label: 'Customer Support', raw: '24/7' },
  ],
};

/**
 * WhatsApp opener templates.
 * `{service}`, `{name}`, `{role}` and `{city}` are substituted at
 * send time, which keeps them editable as plain strings in the CMS.
 */
export const defaultWhatsappTemplates = {
  general:
    'Assalamualaikum, I am interested in hiring a maid through Care Crew Maid. I would like to know more about your services.',
  service:
    'Assalamualaikum, I am interested in your {service} service. Please share the available options.',
  staff:
    'Assalamualaikum, I saw the profile of {name} ({role}) on your website. Is this person available?',
  city: 'Assalamualaikum, I am looking for domestic staff in {city}. Please share the available options.',
  callback: 'Assalamualaikum, I would like to request a callback from the Care Crew team.',
};

const fill = (template, values) =>
  String(template || '').replace(/\{(\w+)\}/g, (match, key) =>
    values[key] === undefined ? match : values[key]
  );

/* ── Live bindings ─────────────────────────────────────────── */

export let businessConfig = defaultBusinessConfig;
export let whatsappTemplates = defaultWhatsappTemplates;

/**
 * Kept as a function-bearing object so every existing call site
 * (`whatsappMessages.service(name)`) keeps working unchanged.
 */
export let whatsappMessages = buildMessages(defaultWhatsappTemplates);

function buildMessages(templates) {
  return {
    general: templates.general,
    callback: templates.callback,
    service: (serviceName) => fill(templates.service, { service: serviceName }),
    staff: (staffName, role) => fill(templates.staff, { name: staffName, role }),
    city: (cityName) => fill(templates.city, { city: cityName }),
  };
}

/** Applies the business record stored in Firestore. */
export function applyBusiness(stored) {
  businessConfig = stored ? deepMerge(defaultBusinessConfig, stored) : defaultBusinessConfig;
  return businessConfig;
}

/** Applies the WhatsApp message templates stored in Firestore. */
export function applyWhatsappTemplates(stored) {
  whatsappTemplates = stored
    ? { ...defaultWhatsappTemplates, ...stored }
    : defaultWhatsappTemplates;
  whatsappMessages = buildMessages(whatsappTemplates);
  return whatsappTemplates;
}

export default businessConfig;
