/**
 * ─────────────────────────────────────────────────────────────
 *  FIRESTORE (LITE) — the public site's database client
 * ─────────────────────────────────────────────────────────────
 *  The full Firestore SDK is ~145KB gzipped, most of which pays
 *  for offline persistence and realtime listeners. A marketing
 *  page needs neither: it reads thirteen documents once at boot
 *  and writes an enquiry when someone submits the form.
 *
 *  The Lite SDK does exactly that in roughly a quarter of the
 *  size, which is real money on a mobile connection. The admin
 *  panel uses the full SDK (see firestore.js) because its whole
 *  value is being realtime.
 *
 *  The two register as separate Firebase components, so having
 *  both in one project is supported — they simply do not share a
 *  cache, which does not matter here.
 * ─────────────────────────────────────────────────────────────
 */

import { getFirestore } from 'firebase/firestore/lite';
import { firebaseApp, isFirebaseConfigured } from './firebase';

export const liteDb = isFirebaseConfigured ? getFirestore(firebaseApp) : null;

export function requireLiteDb() {
  if (!liteDb) {
    throw new Error(
      'Firebase is not configured. Copy .env.example to .env and add your project credentials.'
    );
  }
  return liteDb;
}
