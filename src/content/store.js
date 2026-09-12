/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENT STORE
 * ─────────────────────────────────────────────────────────────
 *  A tiny pub/sub around "the site content changed".
 *
 *  The content itself does NOT live here — it lives in the data
 *  modules as live ES bindings, which is what lets every existing
 *  component keep its plain `import { services } from …` and still
 *  see CMS-managed data. This store only tells React when to
 *  re-render after those bindings have been swapped.
 * ─────────────────────────────────────────────────────────────
 */

import { useSyncExternalStore } from 'react';

let version = 0;
let status = 'idle'; // 'idle' | 'loading' | 'ready' | 'fallback' | 'error'
let lastError = null;
const listeners = new Set();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Bumped every time content is swapped in, which re-renders the tree. */
export const getVersion = () => version;
export const getStatus = () => status;
export const getError = () => lastError;

export function markLoading() {
  status = 'loading';
  emit();
}

/**
 * @param {'ready'|'fallback'|'error'} nextStatus
 *   'ready'    — content came from Firestore
 *   'fallback' — Firebase is not configured; bundled defaults are in use
 *   'error'    — Firestore was reachable but the read failed
 */
export function markLoaded(nextStatus = 'ready', error = null) {
  status = nextStatus;
  lastError = error;
  version += 1;
  emit();
}

/** Re-render trigger for the app root. */
export function useContentVersion() {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}

export function useContentStatus() {
  return useSyncExternalStore(subscribe, getStatus, getStatus);
}
