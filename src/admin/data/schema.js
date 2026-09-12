/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENT SCHEMAS
 * ─────────────────────────────────────────────────────────────
 *  Each content collection is described once, here. The admin's
 *  list view, editor form, validation and CSV export are all
 *  generated from these definitions — so adding a field to a
 *  service means editing one array, not five components.
 *
 *  Field types are rendered by src/admin/ui/fields.jsx.
 * ─────────────────────────────────────────────────────────────
 */

import {
  Briefcase,
  Users,
  MapPin,
  Quote,
  HelpCircle,
} from 'lucide-react';
import { CONTENT_COLLECTIONS } from '../../lib/collections';

export const contentSchemas = {
  [CONTENT_COLLECTIONS.services]: {
    key: CONTENT_COLLECTIONS.services,
    path: CONTENT_COLLECTIONS.services,
    label: 'Services',
    singular: 'Service',
    icon: Briefcase,
    description: 'The service catalogue shown in the Services grid, booking form and footer.',
    /** Which field seeds the document id when creating. */
    slugFrom: 'name',
    titleField: 'name',
    subtitleField: 'summary',
    imageField: 'image',
    iconField: 'iconName',
    /** Columns for the list view. */
    columns: [
      { field: 'name', label: 'Service', primary: true },
      { field: 'serviceType', label: 'Type' },
      { field: 'published', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, hint: 'Shown on the card and in the booking form.' },
      { name: 'iconName', label: 'Icon', type: 'icon' },
      { name: 'summary', label: 'Card summary', type: 'textarea', rows: 2, required: true, hint: 'One sentence — this is what people read in the grid.' },
      { name: 'description', label: 'Full description', type: 'textarea', rows: 4, hint: 'Shown in the service detail dialog.' },
      { name: 'image', label: 'Photograph', type: 'image' },
      { name: 'includes', label: 'What it includes', type: 'stringList', hint: 'Bullet points in the detail dialog.' },
      { name: 'options', label: 'Available options', type: 'tags', hint: 'Short chips, e.g. “Live-in”, “6 days a week”.' },
      { name: 'serviceType', label: 'Arrangement', type: 'text', hint: 'e.g. “Ongoing monthly placement”.' },
      { name: 'suitableFor', label: 'Suitable for', type: 'textarea', rows: 2 },
      { name: 'published', label: 'Published', type: 'toggle', default: true, hint: 'Unpublished services disappear from the site immediately.' },
    ],
  },

  [CONTENT_COLLECTIONS.staff]: {
    key: CONTENT_COLLECTIONS.staff,
    path: CONTENT_COLLECTIONS.staff,
    label: 'Staff profiles',
    singular: 'Staff profile',
    icon: Users,
    description:
      'Example profiles shown on the site. Only publish a photograph or personal detail you have the staff member’s consent to show.',
    slugFrom: 'name',
    titleField: 'name',
    subtitleField: 'role',
    imageField: 'photo',
    columns: [
      { field: 'name', label: 'Name', primary: true },
      { field: 'role', label: 'Role' },
      { field: 'city', label: 'City' },
      { field: 'availability', label: 'Availability' },
      { field: 'published', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'name', label: 'First name', type: 'text', required: true, hint: 'First name only — do not publish full names.' },
      { name: 'role', label: 'Role', type: 'text', required: true, hint: 'e.g. “House Maid”, “Cook”, “Driver”.' },
      { name: 'experienceYears', label: 'Years of experience', type: 'number', min: 0, max: 60 },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'availability', label: 'Availability', type: 'select', options: ['Full-Time', 'Part-Time', 'Live-In', 'Day Shift', 'Night Shift', 'Flexible'] },
      { name: 'languages', label: 'Languages', type: 'tags' },
      { name: 'summary', label: 'Summary', type: 'textarea', rows: 3 },
      { name: 'skills', label: 'Skills', type: 'tags' },
      { name: 'photo', label: 'Photograph', type: 'image', hint: 'Leave empty to show an elegant monogram instead. Only add a photo with written consent.' },
      { name: 'verified', label: 'Show “Verified” badge', type: 'toggle', default: true, hint: 'Only enable where you have actually completed the checks.' },
      { name: 'published', label: 'Published', type: 'toggle', default: true },
    ],
  },

  [CONTENT_COLLECTIONS.cities]: {
    key: CONTENT_COLLECTIONS.cities,
    path: CONTENT_COLLECTIONS.cities,
    label: 'Cities',
    singular: 'City',
    icon: MapPin,
    description:
      'Coverage areas. These also populate the city dropdown in the booking form and the footer.',
    slugFrom: 'name',
    titleField: 'name',
    subtitleField: 'blurb',
    columns: [
      { field: 'name', label: 'City', primary: true },
      { field: 'areas', label: 'Areas', type: 'count' },
      { field: 'published', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'name', label: 'City name', type: 'text', required: true },
      { name: 'blurb', label: 'Short description', type: 'textarea', rows: 2, required: true },
      { name: 'areas', label: 'Areas covered', type: 'tags', hint: 'The first four are shown on the card; the rest become “+N more”.' },
      { name: 'featured', label: 'Featured', type: 'toggle', default: true },
      { name: 'published', label: 'Published', type: 'toggle', default: true },
    ],
  },

  [CONTENT_COLLECTIONS.testimonials]: {
    key: CONTENT_COLLECTIONS.testimonials,
    path: CONTENT_COLLECTIONS.testimonials,
    label: 'Testimonials',
    singular: 'Testimonial',
    icon: Quote,
    description:
      'Publish only reviews you have actually received and have permission to show. Fabricated reviews are unlawful in most markets.',
    slugFrom: 'name',
    titleField: 'name',
    subtitleField: 'quote',
    columns: [
      { field: 'name', label: 'Customer', primary: true },
      { field: 'city', label: 'City' },
      { field: 'service', label: 'Service' },
      { field: 'rating', label: 'Rating', type: 'rating' },
      { field: 'published', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'quote', label: 'Review', type: 'textarea', rows: 5, required: true },
      { name: 'name', label: 'Customer name', type: 'text', required: true, hint: 'First name and initial is usually the right level of detail.' },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'service', label: 'Service used', type: 'text' },
      { name: 'rating', label: 'Rating', type: 'number', min: 1, max: 5, default: 5 },
      { name: 'published', label: 'Published', type: 'toggle', default: true },
    ],
  },

  [CONTENT_COLLECTIONS.faqs]: {
    key: CONTENT_COLLECTIONS.faqs,
    path: CONTENT_COLLECTIONS.faqs,
    label: 'FAQs',
    singular: 'Question',
    icon: HelpCircle,
    description:
      'These are also published as FAQ structured data, so they can appear directly in Google results.',
    slugFrom: 'question',
    titleField: 'question',
    subtitleField: 'answer',
    columns: [
      { field: 'question', label: 'Question', primary: true },
      { field: 'published', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'question', label: 'Question', type: 'text', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', rows: 5, required: true },
      { name: 'published', label: 'Published', type: 'toggle', default: true },
    ],
  },
};

export const schemaList = Object.values(contentSchemas);

export const getSchema = (key) => contentSchemas[key] || null;

/** A blank record with every default applied — used by the "new" form. */
export function emptyRecord(schema) {
  const record = {};
  for (const field of schema.fields) {
    if (field.default !== undefined) record[field.name] = field.default;
    else if (field.type === 'tags' || field.type === 'stringList') record[field.name] = [];
    else if (field.type === 'toggle') record[field.name] = false;
    else if (field.type === 'number') record[field.name] = '';
    else record[field.name] = '';
  }
  return record;
}

/** Returns `{ field: message }` for anything required and missing. */
export function validateRecord(schema, record) {
  const errors = {};
  for (const field of schema.fields) {
    if (!field.required) continue;
    const value = record[field.name];
    const empty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && !value.trim()) ||
      (Array.isArray(value) && value.length === 0);
    if (empty) errors[field.name] = `${field.label} is required.`;
  }
  return errors;
}
