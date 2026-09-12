/**
 * Firebase Auth, kept in its own module.
 *
 * Only the admin panel signs anyone in, so this — and the ~90KB of
 * SDK it pulls in — stays out of the public marketing bundle.
 */

import { getAuth } from 'firebase/auth';
import { firebaseApp, isFirebaseConfigured } from './firebase';

export const auth = isFirebaseConfigured ? getAuth(firebaseApp) : null;

export function requireAuth() {
  if (!auth) throw new Error('Firebase Auth is not configured. See .env.example.');
  return auth;
}
