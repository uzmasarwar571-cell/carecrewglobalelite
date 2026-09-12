/**
 * PLACEHOLDER staff profiles.
 *
 * This is deliberately shaped like an API response so it can later be
 * swapped for `GET /staff` without touching the components:
 *
 *   { id, name, role, experienceYears, city, availability,
 *     languages[], summary, skills[], photo|null, verified }
 *
 * `photo: null` renders an elegant monogram avatar. Set it to a real
 * image path only when you have the staff member's consent.
 */
export const defaultStaff = [
  {
    id: 's1',
    name: 'Maria',
    role: 'House Maid',
    experienceYears: 4,
    city: 'Islamabad',
    availability: 'Full-Time',
    languages: ['Urdu', 'Punjabi'],
    summary:
      'Experienced with daily cleaning, laundry and kitchen support in family homes. Comfortable in joint-family households.',
    skills: ['Cleaning', 'Laundry', 'Kitchen support'],
    photo: null,
    verified: true,
  },
  {
    id: 's2',
    name: 'Shazia',
    role: 'Cook',
    experienceYears: 7,
    city: 'Lahore',
    availability: 'Full-Time',
    languages: ['Urdu', 'Punjabi'],
    summary:
      'Specialises in daily desi home cooking for larger families, including preparation for guests and events.',
    skills: ['Desi cooking', 'Meal planning', 'Kitchen hygiene'],
    photo: null,
    verified: true,
  },
  {
    id: 's3',
    name: 'Nasreen',
    role: 'Nanny',
    experienceYears: 6,
    city: 'Rawalpindi',
    availability: 'Live-In',
    languages: ['Urdu'],
    summary:
      'Calm and patient with infants and toddlers. Experienced with feeding routines, naps and school preparation.',
    skills: ['Infant care', 'Routines', 'School support'],
    photo: null,
    verified: true,
  },
  {
    id: 's4',
    name: 'Rukhsana',
    role: 'Elderly Care Attendant',
    experienceYears: 5,
    city: 'Islamabad',
    availability: 'Day Shift',
    languages: ['Urdu', 'Pashto'],
    summary:
      'Assists with mobility, medicine reminders and daily routines. Respectful and used to working alongside families.',
    skills: ['Mobility support', 'Medicine reminders', 'Companionship'],
    photo: null,
    verified: true,
  },
  {
    id: 's5',
    name: 'Asif',
    role: 'Driver',
    experienceYears: 9,
    city: 'Karachi',
    availability: 'Full-Time',
    languages: ['Urdu', 'Sindhi'],
    summary:
      'Valid licence with long experience of city driving, school runs and family transport across Karachi.',
    skills: ['City routes', 'School runs', 'Airport transfers'],
    photo: null,
    verified: true,
  },
  {
    id: 's6',
    name: 'Kausar',
    role: 'Part-Time Maid',
    experienceYears: 3,
    city: 'Lahore',
    availability: 'Part-Time',
    languages: ['Urdu', 'Punjabi'],
    summary:
      'Available for morning shifts. Reliable with cleaning, mopping, washing up and bathroom upkeep.',
    skills: ['Cleaning', 'Mopping', 'Washing up'],
    photo: null,
    verified: true,
  },
].map((member, index) => ({ ...member, published: true, order: index }));

/* ── Live binding ──────────────────────────────────────────── */

export let staff = defaultStaff;

/** Replaces the roster with the records managed in the admin panel. */
export function applyStaff(stored) {
  const source = Array.isArray(stored) && stored.length ? stored : defaultStaff;
  staff = source
    .filter((member) => member.published !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return staff;
}

export default staff;
