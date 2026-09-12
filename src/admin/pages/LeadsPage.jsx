/**
 * ─────────────────────────────────────────────────────────────
 *  LEADS INBOX
 * ─────────────────────────────────────────────────────────────
 *  Every booking and callback request, with a pipeline status,
 *  internal notes and one-tap WhatsApp / call actions.
 *
 *  Filtering and sorting happen in the browser rather than in
 *  Firestore queries: a domestic staffing agency deals in
 *  hundreds of leads, not millions, and client-side filtering
 *  avoids demanding a composite index for every combination of
 *  status + city + service.
 * ─────────────────────────────────────────────────────────────
 */

import { useMemo, useState } from 'react';
import {
  Search,
  Phone,
  MessageCircle,
  Mail,
  Download,
  Inbox,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  User,
  Send,
  FileText,
} from 'lucide-react';
import { arrayUnion, serverTimestamp } from 'firebase/firestore';
import { cn } from '../../utils/cn';
import { LEADS_COLLECTION, LEAD_STATUSES, LEAD_TYPES, leadStatus } from '../../lib/collections';
import { useCollection } from '../data/hooks';
import { updateItem, deleteItem } from '../data/mutations';
import { useAuth } from '../auth/AuthProvider';
import { businessConfig } from '../../config/business';
import {
  PageHeader,
  Card,
  Button,
  IconButton,
  Input,
  Select,
  EmptyState,
  LoadingPanel,
  Tabs,
  Textarea,
} from '../ui/primitives';
import { Drawer, useToast, useConfirmDialog } from '../ui/overlays';

export function LeadsPage() {
  const { items, loading } = useCollection(LEADS_COLLECTION, { order: ['createdAt', 'desc'] });
  const { profile, can } = useAuth();
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirmDialog();

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [active, setActive] = useState(null);

  const cities = useMemo(
    () => [...new Set(items.map((lead) => lead.city).filter(Boolean))].sort(),
    [items]
  );

  const counts = useMemo(() => {
    const result = { all: items.length };
    for (const status of LEAD_STATUSES) {
      result[status.id] = items.filter((lead) => (lead.status || 'new') === status.id).length;
    }
    return result;
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((lead) => {
      if (tab !== 'all' && (lead.status || 'new') !== tab) return false;
      if (cityFilter && lead.city !== cityFilter) return false;
      if (typeFilter && lead.type !== typeFilter) return false;
      if (!term) return true;
      return [lead.name, lead.phone, lead.email, lead.reference, lead.serviceName, lead.area, lead.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [items, tab, search, cityFilter, typeFilter]);

  const setStatus = async (lead, status) => {
    try {
      await updateItem(
        LEADS_COLLECTION,
        lead.id,
        { status },
        { actor: profile, summary: `Lead ${lead.reference || lead.id} → ${leadStatus(status).label}` }
      );
      setActive((current) => (current?.id === lead.id ? { ...current, status } : current));
      toast.success(`Moved to ${leadStatus(status).label}.`);
    } catch (error) {
      toast.error('Could not update the lead.', { detail: error.message });
    }
  };

  const addNote = async (lead, text) => {
    const note = {
      text: text.trim(),
      by: profile?.name || profile?.email || 'Admin',
      // serverTimestamp() is rejected inside arrayUnion, so the note
      // carries a client time. Precision to the second is plenty here.
      at: new Date().toISOString(),
    };
    await updateItem(
      LEADS_COLLECTION,
      lead.id,
      { notesLog: arrayUnion(note), lastNoteAt: serverTimestamp() },
      { actor: profile, summary: `Note added to lead ${lead.reference || lead.id}` }
    );
    setActive((current) =>
      current?.id === lead.id
        ? { ...current, notesLog: [...(current.notesLog || []), note] }
        : current
    );
  };

  const removeLead = async (lead) => {
    const ok = await confirm({
      title: 'Delete this lead?',
      message: `${lead.name || 'This enquiry'} will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteItem(LEADS_COLLECTION, lead.id, {
        actor: profile,
        summary: `Deleted lead ${lead.reference || lead.id}`,
      });
      setActive(null);
      toast.success('Lead deleted.');
    } catch (error) {
      toast.error('Could not delete the lead.', { detail: error.message });
    }
  };

  const exportCsv = () => {
    downloadCsv(filtered);
    toast.success(`Exported ${filtered.length} leads.`);
  };

  return (
    <>
      <PageHeader
        title="Leads"
        description="Every booking and callback request from the website."
        actions={
          <Button icon={Download} onClick={exportCsv} disabled={!filtered.length}>
            Export CSV
          </Button>
        }
      />

      <Card>
        <Tabs
          className="px-3"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'all', label: 'All', count: counts.all },
            ...LEAD_STATUSES.map((status) => ({
              id: status.id,
              label: status.label,
              count: counts[status.id],
            })),
          ]}
        />

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone, reference…"
              className="pl-9"
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-auto min-w-[8rem]"
            aria-label="Filter by request type"
          >
            <option value="">All types</option>
            <option value={LEAD_TYPES.booking}>Bookings</option>
            <option value={LEAD_TYPES.callback}>Callbacks</option>
          </Select>

          <Select
            value={cityFilter}
            onChange={(event) => setCityFilter(event.target.value)}
            className="w-auto min-w-[8rem]"
            aria-label="Filter by city"
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </div>

        {loading ? (
          <LoadingPanel label="Loading leads…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={items.length ? 'No leads match those filters' : 'No leads yet'}
            description={
              items.length
                ? 'Try clearing the search or switching tabs.'
                : 'Booking and callback requests from the website will appear here the moment they arrive.'
            }
          />
        ) : (
          <LeadTable leads={filtered} onOpen={setActive} onStatus={setStatus} />
        )}
      </Card>

      <LeadDrawer
        lead={active}
        onClose={() => setActive(null)}
        onStatus={setStatus}
        onAddNote={addNote}
        onDelete={can('delete') ? removeLead : undefined}
      />

      {confirmDialog}
    </>
  );
}

/* ── Table ─────────────────────────────────────────────────── */

function LeadTable({ leads, onOpen, onStatus }) {
  return (
    <div className="admin-scroll overflow-x-auto">
      <table className="w-full min-w-[52rem] text-left text-[13px]">
        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">Customer</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Request</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Location</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Received</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Contact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              onClick={() => onOpen(lead)}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {lead.name || 'Unnamed'}
                </p>
                <p className="tabular text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {lead.phoneRaw || lead.phone}
                </p>
              </td>

              <td className="px-4 py-3">
                <p className="text-slate-700 dark:text-slate-300">
                  {lead.type === LEAD_TYPES.callback
                    ? 'Callback request'
                    : lead.serviceName || 'Service not specified'}
                </p>
                {lead.reference && (
                  <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                    {lead.reference}
                  </p>
                )}
              </td>

              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                {lead.city || '—'}
                {lead.area && <span className="text-slate-400"> · {lead.area}</span>}
              </td>

              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                {formatWhen(lead)}
              </td>

              <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                <Select
                  value={lead.status || 'new'}
                  onChange={(event) => onStatus(lead, event.target.value)}
                  className="h-7 w-auto min-w-[7.5rem] text-xs"
                  aria-label={`Status for ${lead.name || 'lead'}`}
                >
                  {LEAD_STATUSES.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </td>

              <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  {lead.whatsapp && (
                    <IconButton
                      as="a"
                      icon={MessageCircle}
                      label="WhatsApp"
                      size="sm"
                      href={waLink(lead)}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  )}
                  {lead.phone && (
                    <IconButton
                      as="a"
                      icon={Phone}
                      label="Call"
                      size="sm"
                      href={`tel:${lead.phone}`}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Detail drawer ─────────────────────────────────────────── */

function LeadDrawer({ lead, onClose, onStatus, onAddNote, onDelete }) {
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const toast = useToast();

  if (!lead) return <Drawer open={false} onClose={onClose} title="" />;

  const submitNote = async () => {
    if (!note.trim()) return;
    setSavingNote(true);
    try {
      await onAddNote(lead, note);
      setNote('');
      toast.success('Note saved.');
    } catch (error) {
      toast.error('Could not save the note.', { detail: error.message });
    } finally {
      setSavingNote(false);
    }
  };

  const details = [
    { label: 'Service', value: lead.serviceName, icon: FileText },
    { label: 'Commitment', value: lead.commitment },
    { label: 'Living arrangement', value: lead.residency },
    { label: 'Experience wanted', value: lead.experience },
    { label: 'Staff gender preference', value: lead.genderPreference },
    { label: 'Household size', value: lead.householdSize },
    { label: 'Duties', value: lead.duties?.length ? lead.duties.join(', ') : null },
    { label: 'Preferred start', value: lead.startDate || (lead.flexibleStart ? 'Flexible' : null), icon: Calendar },
    { label: 'Preferred call time', value: lead.preferredTime, icon: Clock },
    { label: 'Address', value: lead.address, icon: MapPin },
  ].filter((item) => item.value);

  return (
    <Drawer
      open={Boolean(lead)}
      onClose={onClose}
      title={lead.name || 'Enquiry'}
      description={`${lead.type === LEAD_TYPES.callback ? 'Callback request' : 'Booking request'}${
        lead.reference ? ` · ${lead.reference}` : ''
      }`}
      footer={
        <>
          {onDelete && (
            <Button variant="ghost" icon={Trash2} onClick={() => onDelete(lead)} className="mr-auto text-rose-600">
              Delete
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Contact actions */}
        <div className="flex flex-wrap gap-2">
          {lead.whatsapp && (
            <Button
              as="a"
              variant="primary"
              icon={MessageCircle}
              href={waLink(lead)}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </Button>
          )}
          {lead.phone && (
            <Button as="a" icon={Phone} href={`tel:${lead.phone}`}>
              {lead.phoneRaw || lead.phone}
            </Button>
          )}
          {lead.email && (
            <Button as="a" icon={Mail} href={`mailto:${lead.email}`}>
              Email
            </Button>
          )}
        </div>

        {/* Status pipeline */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Status
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {LEAD_STATUSES.map((status) => {
              const current = (lead.status || 'new') === status.id;
              return (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => onStatus(lead, status.id)}
                  title={status.description}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                    current
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  )}
                >
                  {status.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Requirements */}
        {details.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Requirements
            </h3>
            <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {details.map((item) => (
                <div key={item.label} className="flex gap-4 px-3 py-2">
                  <dt className="w-40 shrink-0 text-[13px] text-slate-500 dark:text-slate-400">
                    {item.label}
                  </dt>
                  <dd className="min-w-0 flex-1 text-[13px] text-slate-800 dark:text-slate-200">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {lead.notes && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              What they told us
            </h3>
            <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
              {lead.notes}
            </p>
          </section>
        )}

        {/* Internal notes */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Internal notes
          </h3>

          {(lead.notesLog || []).length > 0 && (
            <ul className="mb-3 space-y-2">
              {[...(lead.notesLog || [])]
                .sort((a, b) => String(b.at).localeCompare(String(a.at)))
                .map((entry, index) => (
                  <li
                    key={`${entry.at}-${index}`}
                    className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <p className="whitespace-pre-line text-[13px] text-slate-700 dark:text-slate-300">
                      {entry.text}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <User className="h-3 w-3" aria-hidden="true" />
                      {entry.by} · {new Date(entry.at).toLocaleString()}
                    </p>
                  </li>
                ))}
            </ul>
          )}

          <Textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What happened on this enquiry?"
          />
          <Button
            className="mt-2"
            size="sm"
            icon={Send}
            variant="primary"
            loading={savingNote}
            disabled={!note.trim()}
            onClick={submitNote}
          >
            Add note
          </Button>
        </section>

        {/* Provenance */}
        <section className="border-t border-slate-200 pt-4 dark:border-slate-800">
          <dl className="space-y-1 text-xs text-slate-400 dark:text-slate-500">
            <div className="flex gap-2">
              <dt>Received</dt>
              <dd className="text-slate-600 dark:text-slate-300">{formatWhen(lead, true)}</dd>
            </div>
            {lead.source && (
              <div className="flex gap-2">
                <dt>Source</dt>
                <dd className="text-slate-600 dark:text-slate-300">{lead.source}</dd>
              </div>
            )}
            {lead.city && (
              <div className="flex gap-2">
                <dt>Location</dt>
                <dd className="text-slate-600 dark:text-slate-300">
                  {[lead.area, lead.city].filter(Boolean).join(', ')}
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </Drawer>
  );
}

/* ── Helpers ───────────────────────────────────────────────── */

export function leadDate(lead) {
  // `createdAt` is a Firestore Timestamp once the server has written
  // it, but is briefly null on a local echo of our own write.
  if (lead.createdAt?.toDate) return lead.createdAt.toDate();
  if (lead.submittedAt) return new Date(lead.submittedAt);
  return null;
}

function formatWhen(lead, absolute = false) {
  const date = leadDate(lead);
  if (!date) return 'Just now';
  if (absolute) return date.toLocaleString();

  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;
  if (minutes < 60 * 24 * 7) return `${Math.round(minutes / (60 * 24))}d ago`;
  return date.toLocaleDateString();
}

function waLink(lead) {
  const number = String(lead.whatsapp || lead.phone || '').replace(/\D/g, '');
  const message = `Assalamualaikum ${lead.name || ''}, this is ${businessConfig.name} regarding your enquiry${
    lead.reference ? ` (${lead.reference})` : ''
  }.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Exports what is currently on screen — filters included. */
function downloadCsv(leads) {
  const columns = [
    'reference', 'type', 'status', 'name', 'phone', 'whatsapp', 'email',
    'city', 'area', 'serviceName', 'commitment', 'residency', 'experience',
    'genderPreference', 'householdSize', 'duties', 'startDate', 'preferredTime',
    'notes', 'source', 'received',
  ];

  const escape = (value) => {
    if (value === null || value === undefined) return '';
    const text = Array.isArray(value) ? value.join('; ') : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const rows = leads.map((lead) =>
    columns
      .map((column) =>
        escape(column === 'received' ? leadDate(lead)?.toISOString() : lead[column])
      )
      .join(',')
  );

  // The BOM makes Excel open UTF-8 correctly, which matters for the
  // Urdu and accented characters that appear in names and areas.
  const csv = `﻿${columns.join(',')}\n${rows.join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default LeadsPage;
