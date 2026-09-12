/**
 * ─────────────────────────────────────────────────────────────
 *  THEME TOKENS
 * ─────────────────────────────────────────────────────────────
 *  Every brand colour, font and radius the public site uses is
 *  declared here once. Tailwind reads them through CSS custom
 *  properties (see tailwind.config.js), which is what lets the
 *  admin panel restyle the entire site at runtime without a
 *  rebuild — and lets the theme editor show a live preview.
 *
 *  The defaults below are the ORIGINAL hand-tuned palette, so an
 *  untouched install renders exactly as designed.
 * ─────────────────────────────────────────────────────────────
 */

/** The reference ramps. Also used as the shape for generated ramps. */
export const defaultRamps = {
  emerald: {
    50: '#EEF6F2',
    100: '#D6EAE1',
    200: '#AED6C5',
    300: '#7FBCA5',
    400: '#4E9C81',
    500: '#2C7D63',
    600: '#1D6350',
    700: '#154C3E',
    800: '#0F3A30',
    900: '#0B2A23',
    950: '#061A16',
  },
  cream: {
    50: '#FDFBF7',
    100: '#FAF6EF',
    200: '#F4EDE1',
    300: '#EAE0CE',
    400: '#DCCDB2',
  },
  gold: {
    200: '#EBD9AC',
    300: '#DCC17C',
    400: '#C9A75A',
    500: '#B08D3F',
    600: '#8E7031',
  },
  charcoal: {
    400: '#6B7472',
    500: '#4C5654',
    600: '#3A4442',
    700: '#2A3331',
    800: '#1C2321',
    900: '#121716',
  },
};

/**
 * Which stop each ramp is "anchored" on in the theme editor's simple
 * mode — the stop whose colour the user picks directly.
 */
export const rampAnchors = {
  emerald: 700,
  cream: 100,
  gold: 400,
  charcoal: 800,
};

/** Human labels for the theme editor. */
export const rampMeta = {
  emerald: {
    label: 'Brand',
    description: 'Primary buttons, headings, dark bands and the navbar.',
  },
  cream: {
    label: 'Surface',
    description: 'Page background and soft card fills.',
  },
  gold: {
    label: 'Accent',
    description: 'Used sparingly — rules, highlights and secondary CTAs.',
  },
  charcoal: {
    label: 'Text',
    description: 'Body copy and muted supporting text.',
  },
};

export const fontPresets = [
  {
    id: 'fraunces-jakarta',
    name: 'Fraunces + Plus Jakarta Sans',
    note: 'The original pairing — warm editorial serif over a clean geometric sans.',
    display: 'Fraunces',
    sans: 'Plus Jakarta Sans',
    googleFonts:
      'family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700',
  },
  {
    id: 'playfair-inter',
    name: 'Playfair Display + Inter',
    note: 'High-contrast classic serif with a neutral, highly legible sans.',
    display: 'Playfair Display',
    sans: 'Inter',
    googleFonts: 'family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700',
  },
  {
    id: 'dmserif-dmsans',
    name: 'DM Serif Display + DM Sans',
    note: 'Confident and modern. Reads well at large display sizes.',
    display: 'DM Serif Display',
    sans: 'DM Sans',
    googleFonts: 'family=DM+Serif+Display&family=DM+Sans:wght@400;500;700',
  },
  {
    id: 'sora-manrope',
    name: 'Sora + Manrope',
    note: 'All-sans, contemporary and tech-forward. No serif at all.',
    display: 'Sora',
    sans: 'Manrope',
    googleFonts: 'family=Sora:wght@500;600;700&family=Manrope:wght@400;500;600;700',
  },
  {
    id: 'lora-worksans',
    name: 'Lora + Work Sans',
    note: 'Softer and more traditional — reassuring for care and family services.',
    display: 'Lora',
    sans: 'Work Sans',
    googleFonts: 'family=Lora:wght@500;600;700&family=Work+Sans:wght@400;500;600;700',
  },
];

/** Ready-made looks the owner can apply in one click. */
export const themePresets = [
  {
    id: 'heritage-emerald',
    name: 'Heritage Emerald',
    description: 'The original identity — deep emerald, warm cream, restrained gold.',
    anchors: { emerald: '#154C3E', cream: '#FAF6EF', gold: '#C9A75A', charcoal: '#1C2321' },
  },
  {
    id: 'midnight-teal',
    name: 'Midnight Teal',
    description: 'Cooler and more corporate. Reads as premium and precise.',
    anchors: { emerald: '#12414B', cream: '#F5F7F7', gold: '#C2A878', charcoal: '#1A2124' },
  },
  {
    id: 'royal-indigo',
    name: 'Royal Indigo',
    description: 'Confident indigo with a champagne accent. Strong on dark bands.',
    anchors: { emerald: '#2B3A70', cream: '#F7F6FB', gold: '#CBAE7B', charcoal: '#1D2030' },
  },
  {
    id: 'terracotta-warmth',
    name: 'Terracotta Warmth',
    description: 'Earthy and human. Suits a family-first, homely tone.',
    anchors: { emerald: '#7A3B2B', cream: '#FBF4EE', gold: '#C98F4F', charcoal: '#2A211D' },
  },
  {
    id: 'slate-professional',
    name: 'Slate Professional',
    description: 'Near-neutral and understated. Lets photography carry the colour.',
    anchors: { emerald: '#2F3E46', cream: '#F6F7F6', gold: '#B08D3F', charcoal: '#1B1F21' },
  },
];

export const defaultTheme = {
  /** The colour the user picked for each ramp's anchor stop. */
  anchors: {
    emerald: defaultRamps.emerald[700],
    cream: defaultRamps.cream[100],
    gold: defaultRamps.gold[400],
    charcoal: defaultRamps.charcoal[800],
  },
  /** Fully resolved ramps — what actually reaches the CSS variables. */
  ramps: defaultRamps,
  /** Standalone colours that are not part of a ramp. */
  singles: {
    sand: '#E7DCC8',
    whatsapp: '#1FA855',
  },
  fonts: {
    presetId: 'fraunces-jakarta',
    display: 'Fraunces',
    sans: 'Plus Jakarta Sans',
    googleFonts:
      'family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700',
  },
  radii: {
    card: 20,
    panel: 28,
  },
  /** Global motion switch — turns off animation site-wide when false. */
  motion: {
    enabled: true,
    /** 0.5 = twice as fast, 2 = half speed. */
    speed: 1,
  },
  presetId: 'heritage-emerald',
};

/**
 * Flattens a theme into the CSS custom properties the stylesheet
 * expects. Colours become "R G B" channel triples so Tailwind's
 * `/50` opacity modifiers keep working.
 */
export function themeToCssVars(theme) {
  const vars = {};
  const merged = mergeTheme(theme);

  for (const [name, ramp] of Object.entries(merged.ramps)) {
    for (const [stop, hex] of Object.entries(ramp)) {
      const channels = hexChannels(hex);
      if (channels) vars[`--c-${name}-${stop}`] = channels;
    }
  }

  for (const [name, hex] of Object.entries(merged.singles)) {
    const channels = hexChannels(hex);
    if (channels) vars[`--c-${name}`] = channels;
  }

  vars['--font-display'] = `"${merged.fonts.display}", Georgia, Cambria, serif`;
  vars['--font-sans'] = `"${merged.fonts.sans}", system-ui, -apple-system, "Segoe UI", sans-serif`;
  vars['--radius-card'] = `${merged.radii.card}px`;
  vars['--radius-panel'] = `${merged.radii.panel}px`;
  vars['--motion-scale'] = merged.motion.enabled ? String(merged.motion.speed) : '0';

  return vars;
}

function hexChannels(hex) {
  if (typeof hex !== 'string') return null;
  let value = hex.trim().replace(/^#/, '');
  if (value.length === 3) value = value.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  const int = parseInt(value, 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

/** Deep-merges a partial stored theme over the defaults. */
export function mergeTheme(partial) {
  if (!partial) return defaultTheme;
  return {
    ...defaultTheme,
    ...partial,
    anchors: { ...defaultTheme.anchors, ...(partial.anchors || {}) },
    ramps: {
      emerald: { ...defaultRamps.emerald, ...(partial.ramps?.emerald || {}) },
      cream: { ...defaultRamps.cream, ...(partial.ramps?.cream || {}) },
      gold: { ...defaultRamps.gold, ...(partial.ramps?.gold || {}) },
      charcoal: { ...defaultRamps.charcoal, ...(partial.ramps?.charcoal || {}) },
    },
    singles: { ...defaultTheme.singles, ...(partial.singles || {}) },
    fonts: { ...defaultTheme.fonts, ...(partial.fonts || {}) },
    radii: { ...defaultTheme.radii, ...(partial.radii || {}) },
    motion: { ...defaultTheme.motion, ...(partial.motion || {}) },
  };
}
