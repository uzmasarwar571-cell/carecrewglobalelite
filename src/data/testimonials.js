/**
 * PLACEHOLDER testimonials.
 * Replace with real, permitted reviews before launch. Keep the same
 * shape and the carousel will pick them up automatically.
 */
export const defaultTestimonials = [
  {
    id: 't1',
    quote:
      'Finding reliable domestic help was difficult until we found Care Crew. The process was simple, the team listened to exactly what we needed, and the maid they matched us with has been with us since.',
    name: 'Ayesha K.',
    city: 'Islamabad',
    service: 'Full-Time Maid',
    rating: 5,
  },
  {
    id: 't2',
    quote:
      'We needed someone to cook for a family of seven. They understood our requirements properly and sent candidates who actually matched. Communication over WhatsApp was quick throughout.',
    name: 'Bilal R.',
    city: 'Lahore',
    service: 'Cooking Maid',
    rating: 5,
  },
  {
    id: 't3',
    quote:
      'As a working mother I was nervous about leaving my son with someone new. The team was patient, let us meet two candidates, and did not pressure us at all. That mattered a lot.',
    name: 'Sana M.',
    city: 'Rawalpindi',
    service: 'Babysitter / Nanny',
    rating: 5,
  },
  {
    id: 't4',
    quote:
      'Arranged an attendant for my father within a few days. She is respectful, punctual and my father is comfortable with her, which was our main concern.',
    name: 'Imran S.',
    city: 'Karachi',
    service: 'Elderly Care',
    rating: 5,
  },
  {
    id: 't5',
    quote:
      'We use them for office cleaning and pantry staff. Straightforward pricing, no surprises, and they arranged a replacement quickly when one of the staff resigned.',
    name: 'Hina A.',
    city: 'Islamabad',
    service: 'Office / Commercial Staff',
    rating: 5,
  },
  {
    id: 't6',
    quote:
      'Booked a part-time maid for four hours a day. What I appreciated most was how clearly they explained the terms upfront instead of leaving things vague.',
    name: 'Usman T.',
    city: 'Lahore',
    service: 'Part-Time Maid',
    rating: 4,
  },
].map((item, index) => ({ ...item, published: true, order: index }));

/* ── Live binding ──────────────────────────────────────────── */

export let testimonials = defaultTestimonials;

export function applyTestimonials(stored) {
  const source = Array.isArray(stored) && stored.length ? stored : defaultTestimonials;
  testimonials = source
    .filter((item) => item.published !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return testimonials;
}

export default testimonials;
