/**
 * Every write the admin panel makes goes through this module, so
 * that timestamps, authorship and the audit trail are applied
 * consistently — a page can never forget to log a change.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, requireDb } from '../../lib/firestore';
import { ACTIVITY_COLLECTION, SITE_COLLECTION } from '../../lib/collections';
import { isPlainObject } from '../../utils/deepMerge';

/**
 * Appends to the audit log. Deliberately fire-and-forget: a failure
 * to log must never roll back or block the change the user asked for.
 */
export async function logActivity({ actor, action, target, summary, meta }) {
  try {
    await addDoc(collection(db, ACTIVITY_COLLECTION), {
      actorId: actor?.id || actor?.uid || null,
      actorName: actor?.name || actor?.email || 'Unknown',
      action,
      target: target || null,
      summary: summary || '',
      meta: meta || null,
      at: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[admin] activity log failed:', error?.message);
  }
}

/** Creates or replaces one of the singleton `site/*` documents. */
export async function saveSiteDoc(docId, data, { actor, summary } = {}) {
  requireDb();
  await setDoc(
    doc(db, SITE_COLLECTION, docId),
    { ...stripUndefined(data), updatedAt: serverTimestamp(), updatedBy: actor?.id || null },
    { merge: true }
  );
  await logActivity({
    actor,
    action: 'update',
    target: `site/${docId}`,
    summary: summary || `Updated ${docId}`,
  });
}

/** Creates a document with a caller-chosen id (slug). */
export async function createItem(path, id, data, { actor, summary } = {}) {
  requireDb();
  await setDoc(doc(db, path, id), {
    ...stripUndefined(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: actor?.id || null,
  });
  await logActivity({
    actor,
    action: 'create',
    target: `${path}/${id}`,
    summary: summary || `Created ${path.replace(/s$/, '')} “${data.name || data.title || id}”`,
  });
}

export async function updateItem(path, id, data, { actor, summary } = {}) {
  requireDb();
  await updateDoc(doc(db, path, id), {
    ...stripUndefined(data),
    updatedAt: serverTimestamp(),
    updatedBy: actor?.id || null,
  });
  await logActivity({
    actor,
    action: 'update',
    target: `${path}/${id}`,
    summary: summary || `Updated ${path.replace(/s$/, '')} “${data.name || data.title || id}”`,
  });
}

export async function deleteItem(path, id, { actor, summary } = {}) {
  requireDb();
  await deleteDoc(doc(db, path, id));
  await logActivity({
    actor,
    action: 'delete',
    target: `${path}/${id}`,
    summary: summary || `Deleted from ${path}: ${id}`,
  });
}

/** Persists a new manual ordering for a content collection. */
export async function reorderItems(path, orderedIds, { actor } = {}) {
  requireDb();
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, path, id), { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
  await logActivity({
    actor,
    action: 'reorder',
    target: path,
    summary: `Reordered ${path}`,
  });
}

/** Writes many documents at once — used by the content seeder. */
export async function bulkSet(path, items, { actor, summary } = {}) {
  requireDb();
  // Firestore caps a batch at 500 writes.
  const chunks = chunk(items, 400);
  for (const group of chunks) {
    const batch = writeBatch(db);
    group.forEach((item) => {
      const { id, ...rest } = item;
      batch.set(doc(db, path, id), {
        ...stripUndefined(rest),
        updatedAt: serverTimestamp(),
        updatedBy: actor?.id || null,
      });
    });
    // eslint-disable-next-line no-await-in-loop -- batches must land in order
    await batch.commit();
  }
  if (summary) await logActivity({ actor, action: 'seed', target: path, summary });
}

/**
 * Firestore rejects `undefined`. Forms produce it constantly (an
 * untouched optional field), so it is stripped once here instead of
 * being guarded against at every call site.
 *
 * Only PLAIN objects are recursed into. Firestore's own types —
 * Timestamp, GeoPoint, DocumentReference — and its field sentinels
 * (serverTimestamp, arrayUnion) are objects with own enumerable
 * properties, so a naive walk would quietly rewrite a Timestamp as a
 * `{seconds, nanoseconds}` map and lose its type on the way back in.
 */
export function stripUndefined(value) {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, stripUndefined(entry)])
  );
}

/** Fields Firestore owns; never write them back from a form. */
const SERVER_FIELDS = ['createdAt', 'updatedAt', 'updatedBy'];

/** Drops the document id and server-managed fields from a form record. */
export function toWritablePayload(record) {
  const payload = { ...record };
  delete payload.id;
  for (const field of SERVER_FIELDS) delete payload[field];
  return payload;
}

function chunk(list, size) {
  const groups = [];
  for (let index = 0; index < list.length; index += size) {
    groups.push(list.slice(index, index + size));
  }
  return groups;
}

/** URL-safe id from a title — used when creating content items. */
export function slugify(text, fallback = 'item') {
  const slug = String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || `${fallback}-${Date.now().toString(36)}`;
}
