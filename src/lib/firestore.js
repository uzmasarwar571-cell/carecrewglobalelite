/**
 * Full Firestore, used only by the admin panel.
 *
 * The realtime listeners are the point: two people working the
 * leads inbox should see the same board without refreshing, and a
 * content save should be reflected the instant it lands.
 *
 * The public site uses the Lite SDK instead — see firestoreLite.js.
 */

import { getFirestore } from 'firebase/firestore';
import { firebaseApp, isFirebaseConfigured } from './firebase';

export const db = isFirebaseConfigured ? getFirestore(firebaseApp) : null;

/** Throws a readable error instead of letting `null.collection()` happen. */
export function requireDb() {
  if (!db) {
    throw new Error(
      'Firebase is not configured. Copy .env.example to .env and add your project credentials.'
    );
  }
  return db;
}
