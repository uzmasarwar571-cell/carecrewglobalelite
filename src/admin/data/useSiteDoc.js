/**
 * Editing one of the singleton `site/*` documents.
 *
 * Handles the pattern every settings-style page needs: load the
 * stored document, merge it over the bundled defaults so a partially
 * filled record still shows sensible values, keep a local draft,
 * track whether it is dirty, and warn before leaving with unsaved
 * changes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SITE_COLLECTION } from '../../lib/collections';
import { deepMerge } from '../../utils/deepMerge';
import { useDocument } from './hooks';
import { saveSiteDoc } from './mutations';

export function useSiteDoc(docId, defaults) {
  const { data, loading, error } = useDocument(SITE_COLLECTION, docId);
  const [draft, setDraft] = useState(() => defaults);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  // Remote updates should not clobber what the user is typing, so the
  // stored document only seeds the draft once (and again after a save).
  const seeded = useRef(false);

  const merged = useMemo(() => {
    if (!data) return defaults;
    const { id, updatedAt, updatedBy, createdAt, ...rest } = data;
    return deepMerge(defaults, rest);
  }, [data, defaults]);

  useEffect(() => {
    if (loading || seeded.current) return;
    setDraft(merged);
    seeded.current = true;
  }, [loading, merged]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(merged),
    [draft, merged]
  );

  /** Shallow patch: `update({ title: 'New' })`. */
  const update = useCallback((patch) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  /** Nested patch by path: `updatePath('popups.welcome.title', 'New')`. */
  const updatePath = useCallback((path, value) => {
    setDraft((current) => setIn(current, path.split('.'), value));
  }, []);

  const reset = useCallback(() => setDraft(merged), [merged]);

  /** Discards edits AND stored values, restoring the bundled defaults. */
  const restoreDefaults = useCallback(() => setDraft(defaults), [defaults]);

  const save = useCallback(
    async ({ actor, summary } = {}) => {
      setSaving(true);
      try {
        await saveSiteDoc(docId, draft, { actor, summary });
        setSavedAt(Date.now());
        seeded.current = false; // let the fresh snapshot re-seed
        return true;
      } finally {
        setSaving(false);
      }
    },
    [docId, draft]
  );

  // Browsers only show their own generic message here, but the prompt
  // itself is what stops an accidental tab close mid-edit.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return {
    draft,
    setDraft,
    update,
    updatePath,
    reset,
    restoreDefaults,
    save,
    saving,
    savedAt,
    dirty,
    loading,
    error,
    stored: merged,
  };
}

/** Immutably sets a nested value: setIn(obj, ['a','b'], 1). */
function setIn(object, path, value) {
  const [head, ...rest] = path;
  if (!rest.length) return { ...object, [head]: value };
  return { ...object, [head]: setIn(object[head] ?? {}, rest, value) };
}
