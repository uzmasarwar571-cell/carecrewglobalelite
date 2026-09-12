/**
 * Firebase Storage, kept in its own module for the same reason as
 * Auth: only the admin panel's media library uploads files, so the
 * public site should never download the Storage SDK.
 */

import { getStorage } from 'firebase/storage';
import { firebaseApp, isFirebaseConfigured } from './firebase';

export const storage = isFirebaseConfigured ? getStorage(firebaseApp) : null;

export function requireStorage() {
  if (!storage) throw new Error('Firebase Storage is not configured. See .env.example.');
  return storage;
}
