/**
 * ─────────────────────────────────────────────────────────────
 *  COLOUR UTILITIES
 * ─────────────────────────────────────────────────────────────
 *  Small, dependency-free helpers used by the theme manager:
 *  parsing, conversion, ramp generation and WCAG contrast so the
 *  admin can warn about unreadable colour choices before they
 *  ship to the live site.
 * ─────────────────────────────────────────────────────────────
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** '#1D6350' | '1d6350' | '#abc' → { r, g, b } (null when unparseable). */
export function hexToRgb(hex) {
  if (typeof hex !== 'string') return null;
  let value = hex.trim().replace(/^#/, '');
  if (value.length === 3) {
    value = value.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  const int = parseInt(value, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function rgbToHex({ r, g, b }) {
  const toHex = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/** Tailwind reads colours as "R G B" channel triples so `/opacity` works. */
export function hexToChannels(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }) {
  const hn = ((h % 360) + 360) % 360 / 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;

  if (sn === 0) {
    const v = ln * 255;
    return { r: v, g: v, b: v };
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;

  const channel = (t) => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };

  return {
    r: channel(hn + 1 / 3) * 255,
    g: channel(hn) * 255,
    b: channel(hn - 1 / 3) * 255,
  };
}

export const hexToHsl = (hex) => {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
};

export const hslToHex = (hsl) => rgbToHex(hslToRgb(hsl));

/**
 * Rebuilds a colour scale around a new base colour.
 *
 * Rather than inventing lightness values, it reuses the lightness
 * curve of the reference ramp (the hand-tuned defaults) and swaps in
 * the new hue, scaling saturation by how the base differs from its
 * reference. A brand colour change therefore keeps the contrast
 * relationships the site was designed with.
 *
 * @param {string} baseHex     the new colour for `baseStop`
 * @param {object} referenceRamp  { [stop]: hex } the ramp to imitate
 * @param {string|number} baseStop which stop the user is setting
 */
export function buildRamp(baseHex, referenceRamp, baseStop = 700) {
  const base = hexToHsl(baseHex);
  const reference = hexToHsl(referenceRamp[baseStop]);
  if (!base || !reference) return { ...referenceRamp };

  // How much more/less saturated the new base is than the old one.
  const saturationRatio = reference.s === 0 ? 1 : clamp(base.s / reference.s, 0.15, 2.6);
  // Keep the user's exact colour at the stop they picked.
  const lightnessShift = base.l - reference.l;

  const result = {};
  for (const [stop, hex] of Object.entries(referenceRamp)) {
    if (String(stop) === String(baseStop)) {
      result[stop] = baseHex.toUpperCase();
      continue;
    }
    const ref = hexToHsl(hex);
    if (!ref) {
      result[stop] = hex;
      continue;
    }
    // Extremes shift less, so the ramp never collapses to flat white/black.
    const distance = Math.abs(ref.l - reference.l) / 100;
    const damping = 1 - clamp(distance * 1.15, 0, 0.9);
    result[stop] = hslToHex({
      h: base.h,
      s: clamp(ref.s * saturationRatio, 0, 100),
      l: clamp(ref.l + lightnessShift * damping, 2, 99),
    });
  }
  return result;
}

/** WCAG 2.1 relative luminance. */
export function luminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/** Contrast ratio between two hex colours, 1–21. */
export function contrastRatio(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** 'AAA' | 'AA' | 'AA Large' | 'Fail' for body-size text. */
export function contrastGrade(foreground, background) {
  const ratio = contrastRatio(foreground, background);
  if (ratio >= 7) return { ratio, grade: 'AAA', pass: true };
  if (ratio >= 4.5) return { ratio, grade: 'AA', pass: true };
  if (ratio >= 3) return { ratio, grade: 'AA Large', pass: false };
  return { ratio, grade: 'Fail', pass: false };
}

/** Picks black or white text for a given background. */
export const readableTextOn = (hex) =>
  contrastRatio('#FFFFFF', hex) >= contrastRatio('#000000', hex) ? '#FFFFFF' : '#000000';

export const isValidHex = (value) => hexToRgb(value) !== null;
