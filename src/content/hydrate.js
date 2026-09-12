/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENT HYDRATION
 * ─────────────────────────────────────────────────────────────
 *  Reads the CMS content out of Firestore and swaps it into the
 *  data modules before React renders, so the first paint is
 *  already the owner's content — no flash of default copy.
 *
 *  If Firebase is not configured, or the read fails, the bundled
 *  defaults stay in place and the site works exactly as it did
 *  before the admin panel existed. That is deliberate: a CMS
 *  outage must never take the marketing site down.
 * ─────────────────────────────────────────────────────────────
 */

import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore/lite';
import { isFirebaseConfigured } from '../lib/firebase';
import { liteDb as db } from '../lib/firestoreLite';
import { SITE_COLLECTION, SITE_DOCS, CONTENT_COLLECTIONS } from '../lib/collections';

import { applyBusiness, applyWhatsappTemplates } from '../config/business';
import { applyImages } from '../config/images';
import { applySettings } from '../config/settings';
import { applyCopy } from '../data/copy';
import { applyBlocks } from '../data/content';
import { applyServices } from '../data/services';
import { applyStaff } from '../data/staff';
import { applyCities } from '../data/cities';
import { applyTestimonials } from '../data/testimonials';
import { applyFaqs } from '../data/faqs';
import { applyLegal } from '../data/legal';
import { refreshContactLinks } from '../utils/whatsapp';
import { applyTheme } from '../theme/applyTheme';
import { markLoading, markLoaded } from './store';

/**
 * The bundle currently on screen. Held so a partial update (a live
 * edit to one `site` document) can be merged over the rest rather
 * than resetting untouched collections back to their defaults.
 */
let currentBundle = {};

export const getCurrentBundle = () => currentBundle;

/**
 * Applies an already-fetched content bundle to the live bindings.
 * Split out from the fetch so the admin panel's live preview can
 * reuse it with unsaved, in-memory edits.
 */
export function applyContent(bundle = {}) {
  currentBundle = bundle;
  applyBusiness(bundle.business);
  applyWhatsappTemplates(bundle.whatsapp);
  applyImages(bundle.images);
  applySettings(bundle.settings);
  applyCopy(bundle.copy);
  applyBlocks(bundle.blocks || {});
  applyLegal(bundle.legal);

  applyServices(bundle.services);
  applyStaff(bundle.staff);
  applyCities(bundle.cities);
  applyTestimonials(bundle.testimonials);
  applyFaqs(bundle.faqs);

  // Depends on the business config, so it has to come after it.
  refreshContactLinks();
  applyTheme(bundle.theme);
}

/** Reads every content document and collection in parallel. */
export async function fetchContentBundle() {
  const siteDocKeys = Object.values(SITE_DOCS);
  const collectionKeys = Object.values(CONTENT_COLLECTIONS);

  const [siteResults, collectionResults] = await Promise.all([
    Promise.all(siteDocKeys.map((key) => getDoc(doc(db, SITE_COLLECTION, key)))),
    Promise.all(
      collectionKeys.map((key) =>
        getDocs(query(collection(db, key), orderBy('order', 'asc'))).catch(() =>
          // A collection with no `order` index yet still needs to load.
          getDocs(collection(db, key))
        )
      )
    ),
  ]);

  const bundle = {};
  siteDocKeys.forEach((key, index) => {
    const snapshot = siteResults[index];
    if (snapshot.exists()) bundle[key] = snapshot.data();
  });
  collectionKeys.forEach((key, index) => {
    bundle[key] = collectionResults[index].docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));
  });

  return bundle;
}

/**
 * Boot-time hydration. Awaited by main.jsx before the first render.
 * Never throws — a failure downgrades to the bundled content.
 */
export async function hydrateContent() {
  if (!isFirebaseConfigured) {
    applyContent({});
    markLoaded('fallback');
    return { ok: false, reason: 'not-configured' };
  }

  markLoading();
  try {
    const bundle = await fetchContentBundle();
    applyContent(bundle);
    markLoaded('ready');
    return { ok: true, bundle };
  } catch (error) {
    console.warn('[content] Falling back to bundled defaults:', error?.message || error);
    applyContent({});
    markLoaded('error', error);
    return { ok: false, reason: 'fetch-failed', error };
  }
}

/**
 * Picks up admin edits in an already-open tab.
 *
 * The Lite SDK has no realtime listeners — that is most of what
 * makes the full SDK four times the size — so this re-reads the
 * content when the visitor returns to the tab, rather than holding
 * a socket open. For a marketing page that is the right trade: the
 * refresh costs one read per return, and an owner checking their
 * change simply switches back to the tab to see it.
 *
 * @returns {() => void} unsubscribe
 */
export function watchSiteDocuments() {
  if (!isFirebaseConfigured || typeof document === 'undefined') return () => {};

  let last = Date.now();

  const onVisible = async () => {
    if (document.visibilityState !== 'visible') return;
    // Don't re-read on every alt-tab; once a minute is plenty.
    if (Date.now() - last < 60_000) return;
    last = Date.now();
    try {
      applyContent(await fetchContentBundle());
      markLoaded('ready');
    } catch (error) {
      console.warn('[content] refresh failed:', error?.message || error);
    }
  };

  document.addEventListener('visibilitychange', onVisible);
  return () => document.removeEventListener('visibilitychange', onVisible);
}
