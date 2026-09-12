/**
 * ─────────────────────────────────────────────────────────────
 *  OVERVIEW
 * ─────────────────────────────────────────────────────────────
 *  The screen an owner opens first: how many enquiries came in,
 *  what stage they are at, which services people actually ask
 *  for, and whether the site content has been set up at all.
 * ─────────────────────────────────────────────────────────────
 */

import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Database,
} from 'lucide-react';
import { LEADS_COLLECTION, LEAD_STATUSES, LEAD_TYPES } from '../../lib/collections';
import { useCollection } from '../data/hooks';
import { inspectContent, seedContent } from '../data/seed';
import { useAuth } from '../auth/AuthProvider';
import { leadDate } from './LeadsPage';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  EmptyState,
  LoadingPanel,
  Skeleton,
} from '../ui/primitives';
import { StatTile, ColumnChart, BarRanking, Meter } from '../ui/charts';
import { useToast, ConfirmDialog } from '../ui/overlays';

const DAY = 86_400_000;

export function OverviewPage() {
  const { items: leads, loading } = useCollection(LEADS_COLLECTION, { order: ['createdAt', 'desc'] });
  const { profile, can } = useAuth();

  const stats = useMemo(() => buildStats(leads), [leads]);

  return (
    <>
      <PageHeader
        title={`Good ${partOfDay()}${profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}`}
        description="Everything coming in from the website, at a glance."
        actions={
          <Button as={Link} to="/admin/leads" variant="primary" iconRight={ArrowRight}>
            Open inbox
          </Button>
        }
      />

      {can('content') && <SetupCard />}

      {/* ── KPI row ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-[128px]" />)
        ) : (
          <>
            <StatTile
              label="Enquiries this week"
              value={stats.thisWeek}
              delta={stats.weekDelta}
              deltaLabel="vs last week"
              trend={stats.dailyCounts.map((day) => day.value)}
              icon={Inbox}
            />
            <StatTile
              label="Awaiting first contact"
              value={stats.newCount}
              hint={stats.oldestNew ? `Oldest: ${stats.oldestNew}` : 'Inbox is clear'}
              icon={Clock}
            />
            <StatTile
              label="Placements made"
              value={stats.placed}
              hint="Leads marked as placed"
              icon={CheckCircle2}
            />
            <StatTile
              label="Total enquiries"
              value={stats.total}
              hint={`${stats.callbacks} callback requests`}
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* ── Charts ──────────────────────────────────────── */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Enquiries received"
            description="Daily count over the last 30 days."
          />
          <CardBody>
            {loading ? (
              <Skeleton className="h-[180px]" />
            ) : stats.total === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No enquiries yet"
                description="Once the site is live, every booking and callback request lands here."
              />
            ) : (
              <ColumnChart data={stats.dailyCounts} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Pipeline" description="Where every enquiry currently sits." />
          <CardBody>
            {loading ? (
              <Skeleton className="h-[180px]" />
            ) : (
              <>
                <BarRanking data={stats.pipeline} ordinal emptyLabel="No enquiries yet." />
                {stats.total > 0 && (
                  <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                    <Meter
                      value={stats.placed}
                      max={stats.total}
                      label="Conversion to placement"
                      caption={`${stats.placed} of ${stats.total} enquiries resulted in a placement.`}
                    />
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Most requested services"
            description="Which services people actually ask for."
          />
          <CardBody>
            {loading ? (
              <Skeleton className="h-32" />
            ) : (
              <BarRanking
                data={stats.services}
                emptyLabel="No service requests recorded yet."
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Where enquiries come from"
            description="Cities named on the booking form."
          />
          <CardBody>
            {loading ? (
              <Skeleton className="h-32" />
            ) : (
              <BarRanking data={stats.cities} emptyLabel="No cities recorded yet." />
            )}
          </CardBody>
        </Card>
      </div>

      {/* ── Recent activity ─────────────────────────────── */}
      <Card className="mt-4">
        <CardHeader
          title="Latest enquiries"
          actions={
            <Button as={Link} to="/admin/leads" size="sm" variant="ghost" iconRight={ArrowRight}>
              View all
            </Button>
          }
        />
        {loading ? (
          <LoadingPanel />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nothing yet"
            description="New enquiries appear here in real time."
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {leads.slice(0, 6).map((lead) => (
              <li key={lead.id} className="flex items-center gap-3 px-5 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {(lead.name || '?').slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-slate-900 dark:text-slate-100">
                    {lead.name || 'Unnamed enquiry'}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {lead.type === LEAD_TYPES.callback
                      ? 'Callback request'
                      : lead.serviceName || 'Service not specified'}
                    {lead.city ? ` · ${lead.city}` : ''}
                  </p>
                </div>
                <Badge tone={toneFor(lead.status)}>
                  {LEAD_STATUSES.find((s) => s.id === (lead.status || 'new'))?.label}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

/* ── First-run content seeding ─────────────────────────────── */

/**
 * Appears only while the CMS is empty. Copying the bundled content
 * into Firestore is what turns "an admin panel wired to nothing"
 * into "an admin panel managing the live site".
 */
function SetupCard() {
  const { profile } = useAuth();
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    inspectContent()
      .then((result) => !cancelled && setReport(result))
      .catch(() => !cancelled && setReport(null));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!report || !report.empty) return null;

  const run = async () => {
    setConfirmOpen(false);
    setBusy(true);
    try {
      await seedContent({ actor: profile, onProgress: setProgress });
      toast.success('Content imported. The site is now managed from here.');
      setReport(await inspectContent());
    } catch (error) {
      toast.error('Import failed.', { detail: error.message });
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  return (
    <>
      <Card className="mb-4 border-indigo-200 bg-indigo-50/60 dark:border-indigo-500/30 dark:bg-indigo-500/5">
        <CardBody className="flex flex-wrap items-center gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white">
            <Database className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Import your site content
            </p>
            <p className="mt-0.5 text-[13px] text-slate-600 dark:text-slate-300">
              The database is empty, so the website is still running on the content built into the
              code. Import it once and everything becomes editable from this panel.
            </p>
          </div>
          <Button
            variant="primary"
            icon={Sparkles}
            loading={busy}
            onClick={() => setConfirmOpen(true)}
          >
            {busy ? progress || 'Importing…' : 'Import content'}
          </Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={run}
        title="Import site content?"
        message="This copies the services, staff, cities, testimonials, FAQs, page copy, theme and settings from the codebase into Firebase. Existing records are never overwritten."
        confirmLabel="Import"
      />
    </>
  );
}

/* ── Derivation ────────────────────────────────────────────── */

function buildStats(leads) {
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // 30 daily buckets, oldest first.
  const dailyCounts = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(startOfToday.getTime() - (29 - index) * DAY);
    return {
      key: date.toDateString(),
      label: `${date.getDate()}`,
      sublabel: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      value: 0,
    };
  });
  const bucketIndex = new Map(dailyCounts.map((day, index) => [day.key, index]));

  let thisWeek = 0;
  let lastWeek = 0;
  const byStatus = {};
  const byService = {};
  const byCity = {};
  let callbacks = 0;
  let oldestNewDate = null;

  for (const lead of leads) {
    const date = leadDate(lead);
    const status = lead.status || 'new';
    byStatus[status] = (byStatus[status] || 0) + 1;

    if (lead.type === LEAD_TYPES.callback) callbacks += 1;
    else if (lead.serviceName) byService[lead.serviceName] = (byService[lead.serviceName] || 0) + 1;

    if (lead.city) byCity[lead.city] = (byCity[lead.city] || 0) + 1;

    if (status === 'new' && date && (!oldestNewDate || date < oldestNewDate)) oldestNewDate = date;

    if (!date) continue;
    const index = bucketIndex.get(date.toDateString());
    if (index !== undefined) dailyCounts[index].value += 1;

    const age = now - date.getTime();
    if (age <= 7 * DAY) thisWeek += 1;
    else if (age <= 14 * DAY) lastWeek += 1;
  }

  return {
    total: leads.length,
    callbacks,
    thisWeek,
    weekDelta: thisWeek - lastWeek,
    newCount: byStatus.new || 0,
    placed: byStatus.placed || 0,
    oldestNew: oldestNewDate ? relativeAge(oldestNewDate) : null,
    dailyCounts,
    pipeline: LEAD_STATUSES.map((status) => ({
      label: status.label,
      value: byStatus[status.id] || 0,
    })),
    services: topEntries(byService, 6),
    cities: topEntries(byCity, 6),
  };
}

function topEntries(counts, limit) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function relativeAge(date) {
  const days = Math.floor((Date.now() - date.getTime()) / DAY);
  if (days < 1) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function toneFor(status) {
  return LEAD_STATUSES.find((s) => s.id === (status || 'new'))?.tone || 'slate';
}

function partOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default OverviewPage;
