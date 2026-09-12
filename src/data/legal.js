/**
 * ─────────────────────────────────────────────────────────────
 *  LEGAL DOCUMENTS — Privacy Policy & Terms
 * ─────────────────────────────────────────────────────────────
 *  ⚠️  The defaults below are PLACEHOLDER wording. They describe
 *  how the site currently behaves and are not legal advice.
 *  Have them reviewed by a legal professional, then replace them
 *  from the admin panel (Content → Legal) — no code change needed.
 *
 *  `{email}`, `{phone}` and `{business}` are substituted with the
 *  live business details when the modal renders.
 * ─────────────────────────────────────────────────────────────
 */

export const defaultLegal = {
  /** Set to false from the admin panel once the copy has been reviewed. */
  showDraftNotice: true,

  privacy: {
    title: 'Privacy Policy',
    updated: 'Draft — pending review',
    sections: [
      {
        heading: 'What we collect',
        body: 'When you submit a booking or callback request we collect the details you enter: your name, phone number, optional WhatsApp number and email address, your city and area, and the requirements you describe. We do not ask for payment details on this website.',
      },
      {
        heading: 'How we use it',
        body: 'We use your details solely to respond to your enquiry, match you with suitable domestic staff, and follow up about that placement. We may contact you by phone, WhatsApp or email using the details you provide.',
      },
      {
        heading: 'Who we share it with',
        body: 'We share the minimum necessary information with staff candidates being considered for your placement — for example your city and the type of work required. We do not sell your details or share them with unrelated third parties.',
      },
      {
        heading: 'How long we keep it',
        body: 'We keep enquiry records for as long as needed to provide the service and to support any replacement request afterwards. You can ask us to delete your details at any time by contacting {email}.',
      },
      {
        heading: 'Cookies and analytics',
        body: 'This website stores a small flag in your browser so that welcome messages are not repeated during the same visit. If analytics are added in future, this policy will be updated to say so.',
      },
      {
        heading: 'Contact',
        body: 'For any question about your data, contact us at {email} or {phone}.',
      },
    ],
  },

  terms: {
    title: 'Terms & Conditions',
    updated: 'Draft — pending review',
    sections: [
      {
        heading: 'Our role',
        body: '{business} is a domestic staff placement service. We introduce households and businesses to staff candidates. The working relationship, timings and payment arrangements are agreed directly between you and the staff member unless stated otherwise in writing.',
      },
      {
        heading: 'Enquiries and bookings',
        body: 'Submitting a request through this website is an enquiry, not a binding contract. Nothing is confirmed until we have spoken with you and both sides have agreed the arrangement.',
      },
      {
        heading: 'Screening',
        body: 'We interview candidates, verify identity documents and check previous household experience where it is available. We describe these checks accurately and do not claim to carry out any verification we do not perform.',
      },
      {
        heading: 'Charges',
        body: 'Service charges are explained to you before a placement is confirmed. We do not add charges after the fact without your agreement.',
      },
      {
        heading: 'Replacement support',
        body: 'If a placement does not work out, contact us and we will help arrange a replacement. The specific terms and any time limits are confirmed with you at the point of booking.',
      },
      {
        heading: 'Limits',
        body: 'We take reasonable care in selecting and recommending candidates, but we cannot guarantee the conduct of any individual. Households remain responsible for supervision within their own home.',
      },
      {
        heading: 'Contact',
        body: 'Questions about these terms can be sent to {email}.',
      },
    ],
  },
};

/* ── Live binding ──────────────────────────────────────────── */

export let legal = defaultLegal;

export function applyLegal(stored) {
  legal = stored ? { ...defaultLegal, ...stored } : defaultLegal;
  return legal;
}

/** Substitutes the {email} / {phone} / {business} placeholders. */
export function fillLegalTokens(text, business) {
  return String(text || '')
    .replaceAll('{email}', business?.email || '')
    .replaceAll('{phone}', business?.phone || '')
    .replaceAll('{business}', business?.name || '');
}

export default legal;
