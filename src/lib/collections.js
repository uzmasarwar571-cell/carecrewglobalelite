/**
 * ─────────────────────────────────────────────────────────────
 *  FIRESTORE LAYOUT
 * ─────────────────────────────────────────────────────────────
 *  One place that names every document and collection, so the
 *  public site, the admin panel and the security rules can never
 *  drift apart.
 *
 *  site/{doc}      — singleton documents, publicly readable
 *  {collection}    — ordered content lists, publicly readable
 *  leads           — customer enquiries, write-only for the public
 *  admins          — who may sign in to the panel
 *  activity        — audit trail of admin changes
 * ─────────────────────────────────────────────────────────────
 */

/** Singleton documents under the `site` collection. */
export const SITE_DOCS = {
  business: 'business',
  copy: 'copy',
  blocks: 'blocks',
  theme: 'theme',
  images: 'images',
  settings: 'settings',
  legal: 'legal',
  whatsapp: 'whatsapp',
};

export const SITE_COLLECTION = 'site';

/** Content collections editable as ordered lists in the CMS. */
export const CONTENT_COLLECTIONS = {
  services: 'services',
  staff: 'staff',
  cities: 'cities',
  testimonials: 'testimonials',
  faqs: 'faqs',
};

export const LEADS_COLLECTION = 'leads';
export const MEDIA_COLLECTION = 'media';
export const ADMINS_COLLECTION = 'admins';
export const ACTIVITY_COLLECTION = 'activity';

/** Pipeline a lead moves through in the admin inbox. */
export const LEAD_STATUSES = [
  { id: 'new', label: 'New', tone: 'blue', description: 'Just arrived — nobody has looked at it yet.' },
  { id: 'contacted', label: 'Contacted', tone: 'amber', description: 'We have reached out and are waiting on the customer.' },
  { id: 'matching', label: 'Matching', tone: 'violet', description: 'Shortlisting candidates for this household.' },
  { id: 'placed', label: 'Placed', tone: 'green', description: 'Staff member confirmed and started.' },
  { id: 'closed', label: 'Closed', tone: 'slate', description: 'No longer active — declined, unreachable or duplicate.' },
];

export const LEAD_STATUS_IDS = LEAD_STATUSES.map((s) => s.id);

export const leadStatus = (id) => LEAD_STATUSES.find((s) => s.id === id) || LEAD_STATUSES[0];

/** Lead source — where the enquiry came from. */
export const LEAD_TYPES = {
  booking: 'booking',
  callback: 'callback',
};

/** Roles an admin user can hold. */
export const ADMIN_ROLES = [
  {
    id: 'owner',
    label: 'Owner',
    description: 'Full access, including managing other admins and deleting content.',
  },
  {
    id: 'editor',
    label: 'Editor',
    description: 'Can edit all content, theme and settings. Cannot manage admins.',
  },
  {
    id: 'staff',
    label: 'Staff',
    description: 'Can read and work the leads inbox. Cannot change site content.',
  },
];

export const roleMeta = (id) => ADMIN_ROLES.find((r) => r.id === id) || ADMIN_ROLES[2];

/** Capability check used throughout the admin UI. */
export function can(role, capability) {
  const matrix = {
    owner: ['leads', 'content', 'theme', 'settings', 'media', 'admins', 'delete'],
    editor: ['leads', 'content', 'theme', 'settings', 'media'],
    staff: ['leads'],
  };
  return (matrix[role] || matrix.staff).includes(capability);
}
