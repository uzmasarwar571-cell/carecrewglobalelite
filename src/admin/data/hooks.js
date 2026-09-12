/**
 * Live Firestore bindings for the admin panel.
 *
 * Everything is realtime (`onSnapshot`) rather than fetch-on-mount:
 * two people working the leads inbox at once should see the same
 * board, and a content edit should reflect immediately after saving
 * without a manual refresh.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  limit as limitTo,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { isFirebaseConfigured } from '../../lib/firebase';
import { db } from '../../lib/firestore';

/**
 * Subscribes to a single document.
 * @returns {{ data: object|null, loading: boolean, error: Error|null, exists: boolean }}
 */
export function useDocument(path, id) {
  const [state, setState] = useState({ data: null, loading: true, error: null, exists: false });

  useEffect(() => {
    if (!isFirebaseConfigured || !path || !id) {
      setState({ data: null, loading: false, error: null, exists: false });
      return undefined;
    }
    setState((current) => ({ ...current, loading: true }));

    return onSnapshot(
      doc(db, path, id),
      (snapshot) => {
        setState({
          data: snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null,
          exists: snapshot.exists(),
          loading: false,
          error: null,
        });
      },
      (error) => setState({ data: null, exists: false, loading: false, error })
    );
  }, [path, id]);

  return state;
}

/**
 * Subscribes to a collection.
 *
 * @param {string} path
 * @param {object} options
 * @param {[string,'asc'|'desc']} [options.order]  e.g. ['order', 'asc']
 * @param {[string,string,any]}   [options.filter] e.g. ['status', '==', 'new']
 * @param {number}                [options.max]
 */
export function useCollection(path, options = {}) {
  const { order, filter, max } = options;
  // Arrays are recreated on every render — serialise so the effect
  // does not resubscribe on each one.
  const orderKey = order ? order.join(':') : '';
  const filterKey = filter ? filter.join(':') : '';

  const [state, setState] = useState({ items: [], loading: true, error: null });

  useEffect(() => {
    if (!isFirebaseConfigured || !path) {
      setState({ items: [], loading: false, error: null });
      return undefined;
    }

    const constraints = [];
    if (filterKey) {
      const [field, op, value] = filterKey.split(':');
      constraints.push(where(field, op, value));
    }
    if (orderKey) {
      const [field, direction] = orderKey.split(':');
      constraints.push(orderBy(field, direction));
    }
    if (max) constraints.push(limitTo(max));

    setState((current) => ({ ...current, loading: true }));

    return onSnapshot(
      query(collection(db, path), ...constraints),
      (snapshot) => {
        setState({
          items: snapshot.docs.map((document) => ({ id: document.id, ...document.data() })),
          loading: false,
          error: null,
        });
      },
      (error) => {
        console.warn(`[admin] ${path} subscription failed:`, error?.message);
        setState({ items: [], loading: false, error });
      }
    );
  }, [path, orderKey, filterKey, max]);

  return state;
}

/**
 * Content collections are ordered by an `order` field. Documents
 * created before that field existed sort last rather than vanishing,
 * which `orderBy` in Firestore would otherwise do.
 */
export function useOrderedCollection(path) {
  const { items, loading, error } = useCollection(path);
  const ordered = useMemo(
    () =>
      [...items].sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return String(a.name || a.title || a.question || a.id).localeCompare(
          String(b.name || b.title || b.question || b.id)
        );
      }),
    [items]
  );
  return { items: ordered, loading, error };
}
