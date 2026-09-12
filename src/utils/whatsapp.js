import { businessConfig, whatsappMessages } from '../config/business';

/**
 * Builds a wa.me link with a correctly URL-encoded prefilled message.
 * Everything WhatsApp-related on the site goes through here so the
 * number only ever lives in one place (config/business.js).
 */
export function buildWhatsAppUrl(message) {
  const text = message ?? whatsappMessages.general;
  const number = String(businessConfig.whatsapp).replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Opens WhatsApp in a new tab. Safe against reverse-tabnabbing. */
export function openWhatsApp(message) {
  const url = buildWhatsAppUrl(message);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ── Contact hrefs ───────────────────────────────────────────
   These are `let` bindings rather than constants because the phone
   number and email can be changed from the admin panel after the
   module has already been evaluated. `refreshContactLinks()` is
   called once content hydration finishes.
   ──────────────────────────────────────────────────────────── */

/** tel: link for "Call Now" buttons. */
export let telHref = buildTelHref();

/** mailto: link for the contact section. */
export let mailHref = buildMailHref();

function buildTelHref() {
  return `tel:${String(businessConfig.phoneDial || '').replace(/[^\d+]/g, '')}`;
}

function buildMailHref() {
  return `mailto:${businessConfig.email || ''}`;
}

/** Recomputes the hrefs after the business config changes. */
export function refreshContactLinks() {
  telHref = buildTelHref();
  mailHref = buildMailHref();
}

/**
 * Turns a completed booking into a readable WhatsApp message so the
 * customer can send their request directly if they prefer.
 */
export function bookingToWhatsAppMessage(data) {
  const lines = [
    `Assalamualaikum, I would like to request domestic staff through ${businessConfig.name}.`,
    '',
    `*Service:* ${data.serviceName || '—'}`,
    `*Arrangement:* ${[data.commitment, data.residency].filter(Boolean).join(', ') || '—'}`,
    `*City:* ${data.city || '—'}${data.area ? ` (${data.area})` : ''}`,
    `*Preferred start:* ${data.startDate || 'As soon as possible'}`,
    `*Name:* ${data.name || '—'}`,
    `*Phone:* ${data.phone || '—'}`,
  ];

  if (data.experience) lines.push(`*Preferred experience:* ${data.experience}`);
  if (data.genderPreference && data.genderPreference !== 'No preference') {
    lines.push(`*Staff gender preference:* ${data.genderPreference}`);
  }
  if (data.householdSize) lines.push(`*Household members:* ${data.householdSize}`);
  if (data.duties?.length) lines.push(`*Required duties:* ${data.duties.join(', ')}`);
  if (data.notes) lines.push(`*Notes:* ${data.notes}`);

  return lines.join('\n');
}
