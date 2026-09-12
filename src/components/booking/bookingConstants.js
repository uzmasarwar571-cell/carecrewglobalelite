/** Option lists for the booking form. Edit freely — the UI adapts. */

export const commitmentOptions = ['Full-time', 'Part-time', 'One-off / Short term'];

export const residencyOptions = ['Live-out', 'Live-in', 'Either is fine'];

export const experienceOptions = [
  'No preference',
  '1+ years',
  '3+ years',
  '5+ years',
];

export const genderOptions = ['No preference', 'Female staff', 'Male staff'];

export const householdSizeOptions = ['1–2 people', '3–5 people', '6–8 people', 'More than 8'];

export const dutyOptions = [
  'Cleaning',
  'Cooking',
  'Laundry & ironing',
  'Washing up',
  'Childcare',
  'Elderly care',
  'Grocery & errands',
  'Driving',
  'Pet care',
];

export const timeSlotOptions = [
  'Any time',
  'Morning (9 AM – 12 PM)',
  'Afternoon (12 PM – 4 PM)',
  'Evening (4 PM – 9 PM)',
];

export const steps = [
  { key: 'service', label: 'Service' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'location', label: 'Location' },
  { key: 'contact', label: 'Contact' },
  { key: 'schedule', label: 'Start date' },
  { key: 'summary', label: 'Confirm' },
];

export const initialBookingState = {
  serviceId: '',
  commitment: '',
  residency: '',
  experience: 'No preference',
  genderPreference: 'No preference',
  householdSize: '',
  duties: [],
  notes: '',
  city: '',
  area: '',
  address: '',
  name: '',
  phone: '',
  whatsapp: '',
  email: '',
  startDate: '',
};
