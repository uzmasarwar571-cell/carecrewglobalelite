/**
 * Writes a theme onto the document as CSS custom properties, and
 * loads the matching Google Fonts stylesheet if the pairing changed.
 *
 * Called on boot (public site + admin) and again on every keystroke
 * in the theme editor's live preview, so it must be cheap and
 * idempotent.
 */

import { themeToCssVars, mergeTheme } from './tokens';

const FONT_LINK_ID = 'ccm-theme-fonts';

export function applyTheme(theme, target = typeof document !== 'undefined' ? document.documentElement : null) {
  if (!target) return;

  const vars = themeToCssVars(theme);
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }

  const merged = mergeTheme(theme);
  loadFonts(merged.fonts?.googleFonts);
  syncBrowserThemeColor(merged.ramps.emerald[900]);

  // CSS animations and Framer Motion both key off this attribute.
  if (target.dataset) {
    target.dataset.motion = merged.motion?.enabled === false ? 'off' : 'on';
  }
}

/** True when the theme has animation switched off. */
export function isMotionDisabled() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.motion === 'off';
}

/**
 * Swaps the Google Fonts <link>. Keeps the original <link> in
 * index.html untouched so the default pairing never flashes.
 */
function loadFonts(googleFontsQuery) {
  if (typeof document === 'undefined' || !googleFontsQuery) return;

  const href = `https://fonts.googleapis.com/css2?${googleFontsQuery}&display=swap`;
  let link = document.getElementById(FONT_LINK_ID);

  if (link && link.getAttribute('href') === href) return;

  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

/** Keeps the mobile browser chrome in sync with the brand colour. */
function syncBrowserThemeColor(hex) {
  if (typeof document === 'undefined' || !hex) return;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', hex);
}

export default applyTheme;
