/**
 * Cities served. Add a new object here and it appears everywhere —
 * the cities grid, the booking form dropdown and the footer.
 */
export const defaultCities = [
  {
    id: 'islamabad',
    name: 'Islamabad',
    blurb: 'Full coverage across all sectors, from F and G series to DHA and Bahria.',
    areas: ['F Sectors', 'G Sectors', 'E-11', 'DHA', 'Bahria Town', 'Gulberg Greens'],
    featured: true,
  },
  {
    id: 'rawalpindi',
    name: 'Rawalpindi',
    blurb: 'Staff available across Saddar, Satellite Town, Chaklala and surrounding areas.',
    areas: ['Saddar', 'Satellite Town', 'Chaklala Scheme', 'Bahria Town', 'Askari'],
    featured: true,
  },
  {
    id: 'lahore',
    name: 'Lahore',
    blurb: 'Serving DHA, Gulberg, Johar Town, Model Town and nearby localities.',
    areas: ['DHA', 'Gulberg', 'Johar Town', 'Model Town', 'Bahria Town', 'Askari'],
    featured: true,
  },
  {
    id: 'karachi',
    name: 'Karachi',
    blurb: 'Coverage across Clifton, DHA, Gulshan, PECHS and North Nazimabad.',
    areas: ['Clifton', 'DHA', 'Gulshan-e-Iqbal', 'PECHS', 'North Nazimabad'],
    featured: true,
  },
].map((city, index) => ({ ...city, published: true, order: index }));

/* ── Live bindings ─────────────────────────────────────────── */

export let cities = defaultCities;

/** City names for <select> inputs, with an escape hatch. */
export let cityOptions = buildCityOptions(cities);

export function applyCities(stored) {
  const source = Array.isArray(stored) && stored.length ? stored : defaultCities;
  cities = source
    .filter((city) => city.published !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  cityOptions = buildCityOptions(cities);
  return cities;
}

function buildCityOptions(list) {
  return [...list.map((c) => c.name), 'Other city'];
}

export default cities;
