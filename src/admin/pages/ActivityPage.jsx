/**
 * Audit trail. Every write the panel makes is logged, so when a
 * heading changes or a lead disappears there is a record of who
 * did it and when.
 */

import { useMemo, useState } from 'react';
import {
  History,
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown,
  Database,
  Search,
} from 'lucide-react';
import { ACTIVITY_COLLECTION } from '../../lib/collections';
import { useCollection } from '../data/hooks';
import {
  PageHeader,
  Card,
  Input,
  Select,
  Badge,
  EmptyState,
  LoadingPanel,
} from '../ui/primitives';

const ACTION_META = {
  create: { label: 'Created', icon: Plus, tone: 'green' },
  update: { label: 'Updated', icon: Pencil, tone: 'blue' },
  delete: { label: 'Deleted', icon: Trash2, tone: 'rose' },
  reorder: { label: 'Reordered', icon: ArrowUpDown, tone: 'violet' },
  seed: { label: 'Imported', icon: Database, tone: 'indigo' },
};

export function ActivityPage() {
  const { items, loading } = useCollection(ACTIVITY_COLLECTION, {
    order: ['at', 'desc'],
    max: 300,
  });
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((entry) => {
      if (action && entry.action !== action) return false;
      if (!term) return true;
      return [entry.summary, entry.actorName, entry.target]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [items, search, action]);

  /** Groups entries under a date heading so the list reads as a diary. */
  const grouped = useMemo(() => {
    const groups = new Map();
    for (const entry of filtered) {
      const date = entry.at?.toDate ? entry.at.toDate() : null;
      const key = date ? date.toDateString() : 'Pending';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry);
    }
    return [...groups.entries()];
  }, [filtered]);

  return (
    <>
      <PageHeader
        breadcrumb="Administration"
        title="Activity log"
        description="Every change made through this panel, most recent first."
      />

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search changes or people…"
              className="pl-9"
            />
          </div>
          <Select
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="w-auto min-w-[8rem]"
            aria-label="Filter by action"
          >
            <option value="">All actions</option>
            {Object.entries(ACTION_META).map(([id, meta]) => (
              <option key={id} value={id}>
                {meta.label}
              </option>
            ))}
          </Select>
        </div>

        {loading ? (
          <LoadingPanel />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={History}
            title={items.length ? 'Nothing matches those filters' : 'No activity yet'}
            description={
              items.length
                ? 'Try a different search term.'
                : 'Changes made from this panel will be recorded here.'
            }
          />
        ) : (
          <div>
            {grouped.map(([date, entries]) => (
              <section key={date}>
                <h2 className="sticky top-14 z-10 border-b border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
                  {date === 'Pending' ? 'Just now' : formatDateHeading(date)}
                </h2>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {entries.map((entry) => {
                    const meta = ACTION_META[entry.action] || {
                      label: entry.action,
                      icon: History,
                      tone: 'slate',
                    };
                    const Icon = meta.icon;
                    const time = entry.at?.toDate ? entry.at.toDate() : null;

                    return (
                      <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] text-slate-800 dark:text-slate-200">
                            {entry.summary || meta.label}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-400 dark:text-slate-500">
                            <span>{entry.actorName || 'Unknown'}</span>
                            {time && <span>· {time.toLocaleTimeString()}</span>}
                            {entry.target && (
                              <code className="font-mono text-[11px]">· {entry.target}</code>
                            )}
                          </p>
                        </div>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

function formatDateHeading(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
}

export default ActivityPage;
