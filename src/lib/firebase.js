/**
 * ─────────────────────────────────────────────────────────────
 *  FIREBASE — single initialisation point
 * ─────────────────────────────────────────────────────────────
 *  Credentials come from environment variables so nothing secret
 *  or environment-specific is committed. Copy `.env.example` to
 *  `.env` and fill in the values from your Firebase console
 *  (Project settings → General → Your apps → Web app).
 *
 *  This module deliberately initialises NOTHING but the app
 *  itself. Each SDK gets its own module so the bundler can keep
 *  it out of builds that do not use it:
 *
 *    firestoreLite.js  → public site (reads content, writes leads)
 *    firestore.js      → admin panel (realtime listeners)
 *    firebaseAuth.js   → admin panel (sign-in)
 *    firebaseStorage.js→ admin panel (media uploads)
 *
 *  The whole app degrades gracefully when Firebase is NOT
 *  configured: the public site falls back to the bundled default
 *  content, and the admin panel shows a setup screen instead of
 *  crashing on a null app.
 * ─────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, getApp } from 'firebase/app';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * True only when every required key is present. Checked before any
 * Firebase call so a half-filled .env fails loudly in one place
 * rather than as a cryptic SDK error deep in a component.
 */
export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId && config.authDomain
);

/** Which keys are missing — surfaced on the admin setup screen. */
export const missingFirebaseKeys = Object.entries({
  VITE_FIREBASE_API_KEY: config.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: config.authDomain,
  VITE_FIREBASE_PROJECT_ID: config.projectId,
  VITE_FIREBASE_STORAGE_BUCKET: config.storageBucket,
  VITE_FIREBASE_APP_ID: config.appId,
})
  .filter(([, value]) => !value)
  .map(([key]) => key);

// getApps() guard keeps Vite's hot reload from re-initialising.
export const firebaseApp = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(config)
  : null;

export const firebaseProjectId = config.projectId || null;
