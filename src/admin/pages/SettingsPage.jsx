/**
 * ─────────────────────────────────────────────────────────────
 *  SETTINGS
 * ─────────────────────────────────────────────────────────────
 *  Business details, images, section visibility, popups, SEO and
 *  the WhatsApp message templates.
 *
 *  These span four separate Firestore documents (business,
 *  settings, images, whatsapp) but are one mental task for the
 *  owner, so they share one page with tabs and one save action.
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { Building2, Eye, Bell, Search, MessageCircle, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { defaultBusinessConfig, defaultWhatsappTemplates } from '../../config/business';
import { defaultSettings, sectionKeys } from '../../config/settings';
import { defaultImages, imageSlots } from '../../config/images';
import { SITE_DOCS } from '../../lib/collections';
import { useSiteDoc } from '../data/useSiteDoc';
import { useAuth } from '../auth/AuthProvider';
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  IconButton,
  Input,
  Textarea,
  Field,
  Toggle,
  Tabs,
  LoadingPanel,
  Badge,
} from '../ui/primitives';
import { ImageField } from '../ui/fields';
import { SaveBar } from '../ui/SaveBar';
import { useToast } from '../ui/overlays';
import { MediaBrowser } from './MediaPage';

const TABS = [
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'sections', label: 'Sections', icon: Eye },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'popups', label: 'Popups', icon: Bell },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'seo', label: 'SEO', icon: Search },
];

export function SettingsPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('business');
  const [mediaTarget, setMediaTarget] = useState(null);

  const business = useSiteDoc(SITE_DOCS.business, defaultBusinessConfig);
  const settings = useSiteDoc(SITE_DOCS.settings, defaultSettings);
  const images = useSiteDoc(SITE_DOCS.images, defaultImages);
  const whatsapp = useSiteDoc(SITE_DOCS.whatsapp, defaultWhatsappTemplates);

  const docs = [business, settings, images, whatsapp];
  const loading = docs.some((doc) => doc.loading);
  const dirty = docs.some((doc) => doc.dirty);
  const saving = docs.some((doc) => doc.saving);
  const savedAt = Math.max(...docs.map((doc) => doc.savedAt || 0)) || null;

  const saveAll = async () => {
    try {
      // Only write what changed — every write is a billed operation
      // and a row in the activity log.
      await Promise.all(
        docs
          .filter((doc) => doc.dirty)
          .map((doc) => doc.save({ actor: profile, summary: 'Updated settings' }))
      );
      toast.success('Settings saved.');
    } catch (error) {
      toast.error('Could not save settings.', { detail: error.message });
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader breadcrumb="Administration" title="Settings" />
        <Card>
          <LoadingPanel />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb="Administration"
        title="Settings"
        description="Contact details, what the site shows, and how it presents itself to search engines."
      />

      <Card>
        <Tabs
          className="px-3"
          value={tab}
          onChange={setTab}
          tabs={TABS.map(({ id, label }) => ({ id, label }))}
        />

        <CardBody>
          {tab === 'business' && <BusinessTab doc={business} />}
          {tab === 'sections' && <SectionsTab doc={settings} />}
          {tab === 'images' && (
            <ImagesTab doc={images} onBrowse={(apply) => setMediaTarget(() => apply)} />
          )}
          {tab === 'popups' && <PopupsTab doc={settings} />}
          {tab === 'whatsapp' && <WhatsappTab doc={whatsapp} />}
          {tab === 'seo' && <SeoTab doc={settings} business={business} />}
        </CardBody>
      </Card>

      <MediaBrowser
        open={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        onSelect={(url) => {
          mediaTarget?.(url);
          setMediaTarget(null);
        }}
      />

      <SaveBar
        dirty={dirty}
        saving={saving}
        savedAt={savedAt}
        onSave={saveAll}
        onReset={() => docs.forEach((doc) => doc.reset())}
      />
    </>
  );
}

/* ── Business ──────────────────────────────────────────────── */

function BusinessTab({ doc }) {
  const { draft, update, updatePath } = doc;

  const setListItem = (key, index, patch) => {
    const list = [...(draft[key] || [])];
    list[index] = { ...list[index], ...patch };
    update({ [key]: list });
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-5 sm:grid-cols-2">
        <Field label="Business name">
          <Input value={draft.name || ''} onChange={(e) => update({ name: e.target.value })} />
        </Field>
        <Field label="Short name" hint="Used in the admin sidebar and tight spaces.">
          <Input value={draft.shortName || ''} onChange={(e) => update({ shortName: e.target.value })} />
        </Field>
        <Field className="sm:col-span-2" label="Tagline">
          <Input value={draft.tagline || ''} onChange={(e) => update({ tagline: e.target.value })} />
        </Field>
        <Field
          className="sm:col-span-2"
          label="Description"
          hint="Used in structured data and social previews."
        >
          <Textarea
            rows={3}
            value={draft.description || ''}
            onChange={(e) => update({ description: e.target.value })}
          />
        </Field>
      </section>

      <section>
        <h3 className="mb-4 text-[13px] font-semibold text-slate-900 dark:text-slate-100">Contact</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone (displayed)" hint="Exactly as customers should read it.">
            <Input value={draft.phone || ''} onChange={(e) => update({ phone: e.target.value })} />
          </Field>
          <Field label="Phone (dial)" hint="Used in tel: links, e.g. +923475133101.">
            <Input value={draft.phoneDial || ''} onChange={(e) => update({ phoneDial: e.target.value })} />
          </Field>
          <Field
            label="WhatsApp number"
            hint="International format, digits only — no + and no spaces."
          >
            <Input
              value={draft.whatsapp || ''}
              onChange={(e) => update({ whatsapp: e.target.value.replace(/\D/g, '') })}
            />
          </Field>
          <Field label="Email">
            <Input type="email" value={draft.email || ''} onChange={(e) => update({ email: e.target.value })} />
          </Field>
          <Field className="sm:col-span-2" label="Support note" hint="Shown beside the WhatsApp number.">
            <Input value={draft.supportNote || ''} onChange={(e) => update({ supportNote: e.target.value })} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          Opening hours
        </h3>
        <div className="space-y-2">
          {(draft.hours || []).map((slot, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={slot.days || ''}
                onChange={(e) => setListItem('hours', index, { days: e.target.value })}
                placeholder="Monday – Saturday"
              />
              <Input
                value={slot.time || ''}
                onChange={(e) => setListItem('hours', index, { time: e.target.value })}
                placeholder="9:00 AM – 9:00 PM"
              />
              <IconButton
                icon={Trash2}
                label="Remove"
                size="sm"
                className="shrink-0 text-slate-400 hover:text-rose-600"
                onClick={() => update({ hours: draft.hours.filter((_, i) => i !== index) })}
              />
            </div>
          ))}
          <Button
            size="sm"
            icon={Plus}
            onClick={() => update({ hours: [...(draft.hours || []), { days: '', time: '' }] })}
          >
            Add hours row
          </Button>
        </div>
      </section>

      <section>
        <h3 className="mb-1 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          Headline statistics
        </h3>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Shown as animated counters. Only publish figures you could substantiate if asked — delete
          any you cannot.
        </p>
        <div className="space-y-2">
          {(draft.stats || []).map((stat, index) => (
            <div key={index} className="grid grid-cols-[5rem_4rem_1fr_auto] items-center gap-2">
              <Input
                type="number"
                value={stat.value ?? ''}
                onChange={(e) => setListItem('stats', index, { value: Number(e.target.value) })}
                aria-label="Value"
              />
              <Input
                value={stat.suffix || ''}
                onChange={(e) => setListItem('stats', index, { suffix: e.target.value })}
                placeholder="+"
                aria-label="Suffix"
              />
              <Input
                value={stat.label || ''}
                onChange={(e) => setListItem('stats', index, { label: e.target.value })}
                placeholder="Families served"
                aria-label="Label"
              />
              <IconButton
                icon={Trash2}
                label="Remove"
                size="sm"
                className="text-slate-400 hover:text-rose-600"
                onClick={() => update({ stats: draft.stats.filter((_, i) => i !== index) })}
              />
            </div>
          ))}
          <Button
            size="sm"
            icon={Plus}
            onClick={() =>
              update({ stats: [...(draft.stats || []), { value: 0, suffix: '+', label: '' }] })
            }
          >
            Add statistic
          </Button>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          Address &amp; web
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City / locality">
            <Input
              value={draft.address?.locality || ''}
              onChange={(e) => updatePath('address.locality', e.target.value)}
            />
          </Field>
          <Field label="Region">
            <Input
              value={draft.address?.region || ''}
              onChange={(e) => updatePath('address.region', e.target.value)}
            />
          </Field>
          <Field label="Street" hint="Leave empty if you have no public office.">
            <Input
              value={draft.address?.street || ''}
              onChange={(e) => updatePath('address.street', e.target.value)}
            />
          </Field>
          <Field label="Country code">
            <Input
              value={draft.address?.country || ''}
              onChange={(e) => updatePath('address.country', e.target.value)}
            />
          </Field>
          <Field
            className="sm:col-span-2"
            label="Website URL"
            hint="Used for canonical links and structured data. No trailing slash."
          >
            <Input
              value={draft.siteUrl || ''}
              onChange={(e) => update({ siteUrl: e.target.value })}
              placeholder="https://carecrewmaid.com"
            />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          Social profiles
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          {['facebook', 'instagram', 'tiktok', 'linkedin'].map((network) => (
            <Field key={network} label={network[0].toUpperCase() + network.slice(1)}>
              <Input
                value={draft.social?.[network] || ''}
                onChange={(e) => updatePath(`social.${network}`, e.target.value)}
                placeholder="https://…"
              />
            </Field>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Sections ──────────────────────────────────────────────── */

function SectionsTab({ doc }) {
  const { draft, updatePath } = doc;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-1 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          Page sections
        </h3>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Hiding a section removes it from the page and from the navigation immediately. The hero
          and footer are always shown.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {sectionKeys.map((section) => (
            <div
              key={section.key}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <Toggle
                id={`section-${section.key}`}
                checked={draft.sections?.[section.key] !== false}
                onChange={(value) => updatePath(`sections.${section.key}`, value)}
                label={section.label}
                description={section.note}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 pt-6 dark:border-slate-800">
        <h3 className="mb-4 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          Interface features
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            {
              key: 'preloader',
              label: 'Opening animation',
              note: 'The logo animation on first load.',
            },
            {
              key: 'customCursor',
              label: 'Custom cursor',
              note: 'Desktop only. Some visitors find it distracting.',
            },
            {
              key: 'floatingWhatsApp',
              label: 'Floating WhatsApp button',
              note: 'The persistent bubble in the corner.',
            },
            {
              key: 'mobileActionBar',
              label: 'Mobile action bar',
              note: 'The sticky call / WhatsApp / book bar on phones.',
            },
          ].map((feature) => (
            <div
              key={feature.key}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <Toggle
                id={`feature-${feature.key}`}
                checked={draft.features?.[feature.key] !== false}
                onChange={(value) => updatePath(`features.${feature.key}`, value)}
                label={feature.label}
                description={feature.note}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Images ────────────────────────────────────────────────── */

function ImagesTab({ doc, onBrowse }) {
  const { draft, updatePath } = doc;

  return (
    <div className="space-y-6">
      <p className="text-[13px] text-slate-500 dark:text-slate-400">
        The photographs used across the page. Replacing these with real pictures of your own work is
        the single biggest improvement you can make to how the site reads.
      </p>

      {imageSlots.map((slot) => (
        <div
          key={slot.key}
          className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
        >
          <ImageField
            label={slot.label}
            hint={slot.hint}
            value={draft[slot.key]?.src || ''}
            onChange={(value) => updatePath(`${slot.key}.src`, value)}
            onBrowse={() => onBrowse((url) => updatePath(`${slot.key}.src`, url))}
          />
          <Field
            className="mt-3"
            label="Alt text"
            hint="Describe the image for screen readers and for when it fails to load."
          >
            <Input
              value={draft[slot.key]?.alt || ''}
              onChange={(event) => updatePath(`${slot.key}.alt`, event.target.value)}
            />
          </Field>
        </div>
      ))}

      <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
        Service card images are set on each service under <strong>Content → Services</strong>.
      </p>
    </div>
  );
}

/* ── Popups ────────────────────────────────────────────────── */

function PopupsTab({ doc }) {
  const { draft, updatePath } = doc;
  const welcome = draft.popups?.welcome || {};
  const exit = draft.popups?.exitIntent || {};

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <Toggle
            id="welcome-enabled"
            checked={welcome.enabled !== false}
            onChange={(value) => updatePath('popups.welcome.enabled', value)}
            label="Welcome nudge"
            description="A corner card that slides in once per visit, after the visitor has scrolled past the hero."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Delay (seconds)" hint="How long before it may appear.">
            <Input
              type="number"
              min={0}
              value={Math.round((welcome.delay ?? 9000) / 1000)}
              onChange={(e) => updatePath('popups.welcome.delay', Number(e.target.value) * 1000)}
            />
          </Field>
          <Field label="Scroll threshold (px)" hint="It stays hidden until the visitor scrolls this far.">
            <Input
              type="number"
              min={0}
              value={welcome.afterScroll ?? 600}
              onChange={(e) => updatePath('popups.welcome.afterScroll', Number(e.target.value))}
            />
          </Field>
          <Field label="Badge">
            <Input
              value={welcome.badge || ''}
              onChange={(e) => updatePath('popups.welcome.badge', e.target.value)}
            />
          </Field>
          <Field label="Title">
            <Input
              value={welcome.title || ''}
              onChange={(e) => updatePath('popups.welcome.title', e.target.value)}
            />
          </Field>
          <Field className="sm:col-span-2" label="Body">
            <Textarea
              rows={2}
              value={welcome.body || ''}
              onChange={(e) => updatePath('popups.welcome.body', e.target.value)}
            />
          </Field>
          <Field label="Primary button">
            <Input
              value={welcome.primaryCta || ''}
              onChange={(e) => updatePath('popups.welcome.primaryCta', e.target.value)}
            />
          </Field>
          <Field label="WhatsApp button">
            <Input
              value={welcome.whatsappCta || ''}
              onChange={(e) => updatePath('popups.welcome.whatsappCta', e.target.value)}
            />
          </Field>
          <Field label="Dismiss link">
            <Input
              value={welcome.dismissLabel || ''}
              onChange={(e) => updatePath('popups.welcome.dismissLabel', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-6 dark:border-slate-800">
        <div className="mb-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <Toggle
            id="exit-enabled"
            checked={exit.enabled !== false}
            onChange={(value) => updatePath('popups.exitIntent.enabled', value)}
            label="Exit-intent prompt"
            description="Desktop only, once per visit, and only after the visitor has been on the page a while."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Arm after (seconds)">
            <Input
              type="number"
              min={0}
              value={Math.round((exit.delay ?? 15000) / 1000)}
              onChange={(e) => updatePath('popups.exitIntent.delay', Number(e.target.value) * 1000)}
            />
          </Field>
          <Field label="Title">
            <Input
              value={exit.title || ''}
              onChange={(e) => updatePath('popups.exitIntent.title', e.target.value)}
            />
          </Field>
          <Field className="sm:col-span-2" label="Body">
            <Textarea
              rows={2}
              value={exit.body || ''}
              onChange={(e) => updatePath('popups.exitIntent.body', e.target.value)}
            />
          </Field>
          <Field label="Primary button">
            <Input
              value={exit.primaryCta || ''}
              onChange={(e) => updatePath('popups.exitIntent.primaryCta', e.target.value)}
            />
          </Field>
          <Field label="WhatsApp button">
            <Input
              value={exit.whatsappCta || ''}
              onChange={(e) => updatePath('popups.exitIntent.whatsappCta', e.target.value)}
            />
          </Field>
          <Field label="Callback button">
            <Input
              value={exit.callbackCta || ''}
              onChange={(e) => updatePath('popups.exitIntent.callbackCta', e.target.value)}
            />
          </Field>
          <Field label="Dismiss link">
            <Input
              value={exit.dismissLabel || ''}
              onChange={(e) => updatePath('popups.exitIntent.dismissLabel', e.target.value)}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}

/* ── WhatsApp ──────────────────────────────────────────────── */

const TEMPLATES = [
  {
    key: 'general',
    label: 'General enquiry',
    hint: 'Used by every plain “WhatsApp us” button.',
    tokens: [],
  },
  {
    key: 'service',
    label: 'Service enquiry',
    hint: 'Sent from a service card or detail dialog.',
    tokens: ['{service}'],
  },
  {
    key: 'staff',
    label: 'Staff enquiry',
    hint: 'Sent from a staff profile.',
    tokens: ['{name}', '{role}'],
  },
  { key: 'city', label: 'City enquiry', hint: 'Sent from a city card.', tokens: ['{city}'] },
  { key: 'callback', label: 'Callback request', hint: 'Used by the callback prompt.', tokens: [] },
];

function WhatsappTab({ doc }) {
  const { draft, update } = doc;

  return (
    <div className="space-y-5">
      <p className="text-[13px] text-slate-500 dark:text-slate-400">
        The message pre-filled when someone taps a WhatsApp button. Placeholders in braces are
        replaced with the real value before sending.
      </p>

      {TEMPLATES.map((template) => (
        <Field key={template.key} label={template.label} hint={template.hint}>
          <Textarea
            rows={3}
            value={draft[template.key] || ''}
            onChange={(event) => update({ [template.key]: event.target.value })}
          />
          {template.tokens.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {template.tokens.map((token) => (
                <Badge key={token} tone="indigo">
                  <code className="font-mono">{token}</code>
                </Badge>
              ))}
            </div>
          )}
        </Field>
      ))}
    </div>
  );
}

/* ── SEO ───────────────────────────────────────────────────── */

function SeoTab({ doc, business }) {
  const { draft, updatePath } = doc;
  const seo = draft.seo || {};
  const titleLength = (seo.title || '').length;
  const descriptionLength = (seo.description || '').length;

  return (
    <div className="space-y-5">
      <Field
        label="Page title"
        hint={`Shown in the browser tab and as the headline in search results. ${titleLength} characters — aim for 50–60.`}
      >
        <Input value={seo.title || ''} onChange={(e) => updatePath('seo.title', e.target.value)} />
      </Field>

      <Field
        label="Meta description"
        hint={`The snippet under the title in search results. ${descriptionLength} characters — aim for 140–160.`}
      >
        <Textarea
          rows={3}
          value={seo.description || ''}
          onChange={(e) => updatePath('seo.description', e.target.value)}
        />
      </Field>

      <Field
        label="Keywords"
        hint="Google ignores this tag, but some smaller engines still read it. Comma separated."
      >
        <Textarea
          rows={2}
          value={seo.keywords || ''}
          onChange={(e) => updatePath('seo.keywords', e.target.value)}
        />
      </Field>

      <Field
        label="Social share image"
        hint="1200×630 works everywhere. A path like /og-image.jpg is resolved against your site URL."
      >
        <Input value={seo.ogImage || ''} onChange={(e) => updatePath('seo.ogImage', e.target.value)} />
      </Field>

      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <Toggle
          id="seo-indexable"
          checked={seo.indexable !== false}
          onChange={(value) => updatePath('seo.indexable', value)}
          label="Allow search engines to index this site"
          description="Switch off while the site is still being built. Remember to switch it back on before launch."
        />
      </div>

      {/* Search result preview — the fastest way to spot a title that
          will be truncated. */}
      <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Search result preview
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {(business.draft.siteUrl || '').replace(/^https?:\/\//, '')}
        </p>
        <p className="mt-0.5 truncate text-[15px] text-blue-700 dark:text-blue-400">
          {seo.title || 'Untitled page'}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[13px] text-slate-600 dark:text-slate-300">
          {seo.description || 'No description set.'}
        </p>
      </div>
    </div>
  );
}

export default SettingsPage;
