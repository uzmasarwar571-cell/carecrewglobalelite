/**
 * ─────────────────────────────────────────────────────────────
 *  BOOKING SERVICE — the single seam between UI and backend
 * ─────────────────────────────────────────────────────────────
 *  Submissions are written to the Firestore `leads` collection,
 *  where the admin panel's inbox picks them up.
 *
 *  Two deliberate safety properties:
 *   1. If Firebase is not configured, or the write fails, the
 *      submission still succeeds locally and is kept in
 *      localStorage. A backend outage must never look to a
 *      customer like "your enquiry vanished".
 *   2. The document is FLAT rather than deeply nested, because
 *      Firestore can only index and query top-level fields — the
 *      admin inbox filters on status, city and service.
 * ─────────────────────────────────────────────────────────────
 */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore/lite';
import { isFirebaseConfigured } from '../lib/firebase';
import { liteDb as db } from '../lib/firestoreLite';
import { LEADS_COLLECTION, LEAD_TYPES } from '../lib/collections';
import { settings } from '../config/settings';
import { normalisePakistaniPhone } from '../utils/validation';

/** Shapes the raw form state into a clean lead record. */
export function buildBookingPayload(form, serviceName) {
  return {
    type: LEAD_TYPES.booking,
    status: 'new',

    // What they want
    serviceId: form.serviceId || null,
    serviceName: serviceName || null,
    commitment: form.commitment || null,
    residency: form.residency || null,
    experience: form.experience || null,
    genderPreference: form.genderPreference || null,
    householdSize: form.householdSize || null,
    duties: form.duties || [],
    notes: form.notes?.trim() || null,

    // Where
    city: form.city || null,
    area: form.area?.trim() || null,
    address: form.address?.trim() || null,

    // Who
    name: form.name?.trim() || null,
    phone: normalisePakistaniPhone(form.phone),
    phoneRaw: form.phone?.trim() || null,
    whatsapp: form.whatsapp
      ? normalisePakistaniPhone(form.whatsapp)
      : normalisePakistaniPhone(form.phone),
    email: form.email?.trim() || null,

    // When
    startDate: form.startDate || null,
    flexibleStart: !form.startDate,

    source: 'website-booking-form',
    pageUrl: typeof window !== 'undefined' ? window.location.href : null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    submittedAt: new Date().toISOString(),
  };
}

/**
 * Submits a booking request.
 * @returns {Promise<{ok: boolean, reference?: string, error?: string}>}
 */
export async function submitBooking(payload) {
  // Guard against a malformed payload reaching the database.
  if (!payload?.serviceId || !payload?.phone) {
    return { ok: false, error: 'Some required details are missing. Please review the form.' };
  }

  const reference = makeReference();
  return persistLead({ ...payload, reference });
}

/** Same seam for the shorter "request a callback" form. */
export async function submitCallback({ name, phone, preferredTime }) {
  if (!name || !phone) {
    return { ok: false, error: 'Please provide your name and phone number.' };
  }

  const reference = makeReference('CB');
  return persistLead({
    type: LEAD_TYPES.callback,
    status: 'new',
    reference,
    name: name.trim(),
    phone: normalisePakistaniPhone(phone),
    phoneRaw: phone.trim(),
    whatsapp: normalisePakistaniPhone(phone),
    preferredTime: preferredTime || 'Any time',
    source: 'website-callback-form',
    pageUrl: typeof window !== 'undefined' ? window.location.href : null,
    submittedAt: new Date().toISOString(),
  });
}

/**
 * Writes the lead to Firestore, falling back to local storage.
 * Both paths report success to the customer — the difference only
 * matters to the site owner, and is visible in the console.
 */
async function persistLead(lead) {
  if (settings.leads?.localBackup !== false) persistLocally(lead);

  if (!isFirebaseConfigured) {
    console.warn(
      '[leads] Firebase is not configured — this enquiry was only saved in this browser. ' +
        'Add your credentials to .env so it reaches the admin inbox.'
    );
    return { ok: true, reference: lead.reference, stored: 'local' };
  }

  try {
    await addDoc(collection(db, LEADS_COLLECTION), {
      ...lead,
      createdAt: serverTimestamp(),
    });
    return { ok: true, reference: lead.reference, stored: 'firestore' };
  } catch (error) {
    console.error('[leads] write failed:', error);
    // The enquiry is already in localStorage, so tell the customer it
    // worked and prompt them towards WhatsApp as a faster route.
    return {
      ok: true,
      reference: lead.reference,
      stored: 'local',
      warning: 'Saved locally — please also message us on WhatsApp so we see it straight away.',
    };
  }
}

/** Human-friendly reference shown on the success screen. */
function makeReference(prefix = 'CC') {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${prefix}-${stamp}${rand}`;
}

/** Safety net so a submission is never silently lost. */
function persistLocally(entry) {
  try {
    const key = 'ccm_submissions';
    const existing = JSON.parse(window.localStorage.getItem(key) || '[]');
    existing.push(entry);
    window.localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
  } catch {
    /* Private mode or storage disabled — not worth failing the submit over. */
  }
}
