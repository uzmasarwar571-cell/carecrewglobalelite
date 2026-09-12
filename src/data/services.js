import { resolveIcon } from '../lib/icons';
import { images } from '../config/images';

/**
 * Service catalogue.
 *
 * Icons are stored as NAMES ('Home') rather than components, because
 * this same shape round-trips through Firestore when the catalogue is
 * managed from the admin panel. `resolveIcon` turns the name back into
 * a component on the way out, so components still get `service.icon`.
 */
export const defaultServices = [
  {
    id: 'full-time-maid',
    name: 'Full-Time Maid',
    iconName: 'Home',
    image: images.services.fullTime,
    summary: 'Reliable day-to-day household support for families who need consistent help.',
    description:
      'A dedicated maid who becomes part of your household routine — handling daily cleaning, laundry, kitchen support and general upkeep so your home runs smoothly without you having to manage it.',
    includes: [
      'Daily cleaning and dusting',
      'Laundry, ironing and wardrobe care',
      'Kitchen cleaning and washing up',
      'General household organisation',
      'Support with everyday errands at home',
    ],
    options: ['Live-in', 'Live-out', '6 days a week', 'Full working day'],
    serviceType: 'Ongoing monthly placement',
    suitableFor: 'Larger families, joint families, and households that need help every day.',
    published: true,
    order: 0,
  },
  {
    id: 'part-time-maid',
    name: 'Part-Time Maid',
    iconName: 'Clock',
    image: images.services.partTime,
    summary: 'Flexible household help arranged around the hours that suit your schedule.',
    description:
      'Ideal when you need dependable help for a few hours a day rather than a full-time presence. You choose the timings, we match you with staff who can commit to them.',
    includes: [
      'Cleaning and mopping of selected areas',
      'Washing up and kitchen tidying',
      'Laundry support',
      'Bathroom cleaning',
      'Flexible daily or alternate-day visits',
    ],
    options: ['2–4 hours daily', 'Morning or evening slots', 'Selected days', 'Live-out'],
    serviceType: 'Hourly or part-day placement',
    suitableFor: 'Working couples, small families and apartments.',
    published: true,
    order: 1,
  },
  {
    id: 'cooking-maid',
    name: 'Cooking Maid',
    iconName: 'ChefHat',
    image: images.services.cooking,
    summary: 'Experienced kitchen staff for daily meal preparation the way your family likes it.',
    description:
      "Domestic staff experienced in Pakistani home cooking who can prepare daily meals to your family's taste, manage the kitchen and keep it clean afterwards.",
    includes: [
      'Daily breakfast, lunch or dinner preparation',
      'Desi and continental home cooking',
      'Grocery list preparation',
      'Kitchen cleaning after cooking',
      'Meal prep for guests on request',
    ],
    options: ['One meal daily', 'Two meals daily', 'Live-in cook', 'Event or guest cooking'],
    serviceType: 'Daily or monthly placement',
    suitableFor: 'Busy professionals, large families and households that host often.',
    published: true,
    order: 2,
  },
  {
    id: 'cleaning-services',
    name: 'Cleaning Services',
    iconName: 'Sparkles',
    image: images.services.cleaning,
    summary: 'Deep cleaning, dusting, washing and organising — done properly.',
    description:
      'Thorough cleaning for homes and apartments, whether it is a routine deep clean, a pre-Eid clean or getting a property ready before you move in.',
    includes: [
      'Deep cleaning of all rooms',
      'Bathroom and kitchen sanitising',
      'Floor washing and mopping',
      'Dusting, cobweb and surface cleaning',
      'Window, balcony and storage clearing',
    ],
    options: ['One-off deep clean', 'Weekly clean', 'Monthly clean', 'Move-in / move-out clean'],
    serviceType: 'One-off visit or recurring schedule',
    suitableFor: 'Anyone needing a reset — before events, after renovation, or seasonally.',
    published: true,
    order: 3,
  },
  {
    id: 'babysitter-nanny',
    name: 'Babysitter / Nanny',
    iconName: 'Baby',
    image: images.services.babysitter,
    summary: 'Patient, attentive childcare support from staff experienced with children.',
    description:
      'Childcare help for parents who need a trusted extra pair of hands — from feeding and nap routines to school pick-up support and play supervision.',
    includes: [
      'Supervision and safe play',
      'Feeding and meal support',
      'Nap and bedtime routines',
      'Bathing and changing for infants',
      'Help with school routines',
    ],
    options: ['Full-time nanny', 'Part-time babysitter', 'Live-in', 'Newborn support'],
    serviceType: 'Ongoing placement',
    suitableFor: 'Working parents, new parents and families with young children.',
    published: true,
    order: 4,
  },
  {
    id: 'elderly-care',
    name: 'Elderly Care',
    iconName: 'HeartHandshake',
    image: images.services.elderly,
    summary: 'Respectful daily assistance and companionship for elderly family members.',
    description:
      'Compassionate support for parents and grandparents who need help with daily routines while staying comfortable in their own home.',
    includes: [
      'Assistance with daily routines',
      'Medicine reminders',
      'Meal support and feeding help',
      'Mobility and walking assistance',
      'Companionship and conversation',
    ],
    options: ['Day attendant', 'Night attendant', 'Live-in attendant', '24-hour rotation'],
    serviceType: 'Ongoing placement',
    suitableFor: 'Families caring for elderly parents alongside work commitments.',
    published: true,
    order: 5,
  },
  {
    id: 'driver',
    name: 'Driver',
    iconName: 'Car',
    image: images.services.driver,
    summary: 'Professional drivers for family, school and daily commute transport.',
    description:
      'Experienced drivers familiar with local routes for school runs, office commutes, family outings and errands.',
    includes: [
      'School pick and drop',
      'Office commute',
      'Family and shopping trips',
      'Airport transfers',
      'Basic vehicle upkeep and cleanliness',
    ],
    options: ['Full-time driver', 'Part-time driver', 'Live-in', 'Trip-based'],
    serviceType: 'Monthly placement',
    suitableFor: 'Families, working professionals and households with school-going children.',
    published: true,
    order: 6,
  },
  {
    id: 'office-staff',
    name: 'Office / Commercial Staff',
    iconName: 'Building2',
    image: images.services.office,
    summary: 'Support and cleaning staff for offices, clinics and commercial spaces.',
    description:
      'Dependable staff to keep your workplace presentable — cleaning, tea and pantry service, and general office support during business hours.',
    includes: [
      'Daily office cleaning',
      'Pantry, tea and refreshment service',
      'Washroom upkeep',
      'Reception and floor tidiness',
      'Basic errands and dispatch support',
    ],
    options: ['Morning shift', 'Full business day', 'Multiple staff', 'Weekend cover'],
    serviceType: 'Monthly contract',
    suitableFor: 'Offices, clinics, salons, showrooms and small businesses.',
    published: true,
    order: 7,
  },
];

/** Attaches the resolved icon component to a stored service record. */
const hydrateService = (service) => ({ ...service, icon: resolveIcon(service.iconName) });

/* ── Live bindings ───────────────────────────────────────────
   Reassigned by applyServices() once Firestore content arrives.
   Consumers import these directly and read them at render time,
   so they always see the current catalogue.
   ──────────────────────────────────────────────────────────── */

export let services = defaultServices.map(hydrateService);

/** Options shown in the booking form's first step. */
export let bookingServiceOptions = buildBookingOptions(services);

export function applyServices(stored) {
  const source = Array.isArray(stored) && stored.length ? stored : defaultServices;
  services = source
    .filter((service) => service.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(hydrateService);
  bookingServiceOptions = buildBookingOptions(services);
  return services;
}

function buildBookingOptions(list) {
  return [
    ...list.map((s) => ({ id: s.id, name: s.name, icon: s.icon })),
    { id: 'other', name: 'Something Else', icon: resolveIcon('Sparkles') },
  ];
}

export const getServiceById = (id) => services.find((s) => s.id === id) || null;

export default services;
