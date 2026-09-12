/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENT SEEDING
 * ─────────────────────────────────────────────────────────────
 *  Copies the content that ships in the codebase into Firestore,
 *  so a fresh project starts with the real site rather than an
 *  empty CMS the owner has to fill from scratch.
 *
 *  Seeding is additive and explicit: `overwrite: false` (the
 *  default) skips anything that already exists, so pressing the
 *  button twice can never wipe live content.
 * ─────────────────────────────────────────────────────────────
 */

import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firestore';
import { SITE_COLLECTION, SITE_DOCS, CONTENT_COLLECTIONS } from '../../lib/collections';
import { bulkSet, saveSiteDoc, logActivity } from './mutations';

import { defaultBusinessConfig, defaultWhatsappTemplates } from '../../config/business';
import { defaultImages } from '../../config/images';
import { defaultSettings } from '../../config/settings';
import { defaultCopy } from '../../data/copy';
import { defaultBlocks } from '../../data/content';
import { defaultLegal } from '../../data/legal';
import { defaultServices } from '../../data/services';
import { defaultStaff } from '../../data/staff';
import { defaultCities } from '../../data/cities';
import { defaultTestimonials } from '../../data/testimonials';
import { defaultFaqs } from '../../data/faqs';
import { defaultTheme } from '../../theme/tokens';

/** What each singleton document is seeded with. */
const siteDefaults = {
  [SITE_DOCS.business]: defaultBusinessConfig,
  [SITE_DOCS.whatsapp]: defaultWhatsappTemplates,
  [SITE_DOCS.copy]: defaultCopy,
  [SITE_DOCS.blocks]: defaultBlocks,
  [SITE_DOCS.theme]: defaultTheme,
  [SITE_DOCS.images]: defaultImages,
  [SITE_DOCS.settings]: defaultSettings,
  [SITE_DOCS.legal]: defaultLegal,
};

/** What each content collection is seeded with. */
const collectionDefaults = {
  [CONTENT_COLLECTIONS.services]: defaultServices,
  [CONTENT_COLLECTIONS.staff]: defaultStaff,
  [CONTENT_COLLECTIONS.cities]: defaultCities,
  [CONTENT_COLLECTIONS.testimonials]: defaultTestimonials,
  [CONTENT_COLLECTIONS.faqs]: defaultFaqs,
};

/**
 * Reports what is already in Firestore, so the seeding screen can
 * show the owner exactly what will and will not be touched.
 */
export async function inspectContent() {
  const report = { docs: {}, collections: {}, empty: true };

  await Promise.all([
    ...Object.keys(siteDefaults).map(async (key) => {
      const snapshot = await getDoc(doc(db, SITE_COLLECTION, key));
      report.docs[key] = snapshot.exists();
      if (snapshot.exists()) report.empty = false;
    }),
    ...Object.keys(collectionDefaults).map(async (key) => {
      const snapshot = await getDocs(collection(db, key));
      report.collections[key] = snapshot.size;
      if (snapshot.size > 0) report.empty = false;
    }),
  ]);

  return report;
}

/**
 * @param {object} options
 * @param {object} options.actor      the signed-in admin, for the audit log
 * @param {boolean} options.overwrite replace content that already exists
 * @param {(step: string) => void} [options.onProgress]
 */
export async function seedContent({ actor, overwrite = false, onProgress } = {}) {
  const report = await inspectContent();
  const written = { docs: [], collections: [] };
  const skipped = { docs: [], collections: [] };

  for (const [key, value] of Object.entries(siteDefaults)) {
    if (report.docs[key] && !overwrite) {
      skipped.docs.push(key);
      continue;
    }
    onProgress?.(`Writing site/${key}…`);
    // eslint-disable-next-line no-await-in-loop -- keeps progress honest
    await saveSiteDoc(key, value, { actor, summary: `Seeded site/${key}` });
    written.docs.push(key);
  }

  for (const [key, items] of Object.entries(collectionDefaults)) {
    if (report.collections[key] > 0 && !overwrite) {
      skipped.collections.push(key);
      continue;
    }
    onProgress?.(`Writing ${items.length} ${key}…`);
    // eslint-disable-next-line no-await-in-loop -- keeps progress honest
    await bulkSet(key, items, { actor });
    written.collections.push(key);
  }

  await logActivity({
    actor,
    action: 'seed',
    target: 'content',
    summary: overwrite
      ? 'Reset all content to the bundled defaults'
      : `Seeded missing content (${written.docs.length + written.collections.length} groups)`,
  });

  return { written, skipped, report };
}

/** The bundled defaults, for the "restore this section" buttons. */
export const bundledDefaults = { site: siteDefaults, collections: collectionDefaults };
