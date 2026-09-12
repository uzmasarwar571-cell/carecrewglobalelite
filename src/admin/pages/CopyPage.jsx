/**
 * ─────────────────────────────────────────────────────────────
 *  PAGE COPY
 * ─────────────────────────────────────────────────────────────
 *  Every headline, paragraph and button label on the public site,
 *  grouped by the section it appears in and in the order a visitor
 *  scrolls past them — so finding "that sentence in the middle of
 *  the page" takes seconds rather than a hunt through a form.
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { defaultCopy } from '../../data/copy';
import { SITE_DOCS } from '../../lib/collections';
import { useSiteDoc } from '../data/useSiteDoc';
import { useAuth } from '../auth/AuthProvider';
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Field,
  LoadingPanel,
} from '../ui/primitives';
import { StringListEditor } from '../ui/fields';
import { SaveBar } from '../ui/SaveBar';
import { useToast } from '../ui/overlays';

/**
 * How each section is presented. `anchor` links straight to that
 * part of the live site so the owner can see what they are editing.
 */
const SECTIONS = [
  {
    key: 'hero',
    label: 'Hero',
    anchor: '#home',
    description: 'The first screen — the single highest-impact copy on the site.',
    fields: [
      { name: 'badge', label: 'Badge', type: 'text' },
      { name: 'ratingText', label: 'Rating line', type: 'text' },
      { name: 'titleLead', label: 'Headline', type: 'text', hint: 'The first part, in white.' },
      {
        name: 'titleHighlight',
        label: 'Headline — highlighted word',
        type: 'text',
        hint: 'Shown in gold with the hand-drawn underline.',
      },
      { name: 'subtitle', label: 'Sub-headline', type: 'textarea', rows: 3 },
      { name: 'trustPoints', label: 'Trust ticks', type: 'list' },
      { name: 'ctaPrimary', label: 'Primary button', type: 'text' },
      { name: 'ctaSecondary', label: 'Secondary button', type: 'text' },
      { name: 'ctaWhatsapp', label: 'WhatsApp button', type: 'text' },
      { name: 'citiesLinePrefix', label: 'Cities line — before the count', type: 'text' },
      { name: 'citiesLineSuffix', label: 'Cities line — after the count', type: 'text' },
    ],
    groups: [
      {
        key: 'card',
        label: 'Vetting card (desktop)',
        fields: [
          { name: 'title', label: 'Card title', type: 'text' },
          { name: 'subtitle', label: 'Card subtitle', type: 'text' },
          { name: 'items', label: 'Checklist', type: 'list' },
          { name: 'cta', label: 'Card button', type: 'text' },
          { name: 'note', label: 'Note under the button', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'services',
    label: 'Services',
    anchor: '#services',
    description: 'Heading for the services grid, plus the panel underneath it.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
      { name: 'cardLink', label: 'Card link label', type: 'text' },
      { name: 'ctaTitle', label: 'Panel heading', type: 'text' },
      { name: 'ctaDescription', label: 'Panel description', type: 'textarea', rows: 2 },
      { name: 'ctaPrimary', label: 'Panel primary button', type: 'text' },
      { name: 'ctaSecondary', label: 'Panel secondary button', type: 'text' },
    ],
  },
  {
    key: 'howItWorks',
    label: 'How it works',
    anchor: '#how-it-works',
    description: 'The four-step process band. Edit the steps themselves under Content blocks.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
      { name: 'cta', label: 'Button', type: 'text' },
      { name: 'note', label: 'Note under the button', type: 'text' },
    ],
  },
  {
    key: 'about',
    label: 'About',
    anchor: '#about',
    description: 'Your story. The values list lives under Content blocks.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'paragraphs', label: 'Body paragraphs', type: 'list' },
      { name: 'quote', label: 'Pull quote', type: 'textarea', rows: 3 },
      { name: 'cta', label: 'Button', type: 'text' },
      { name: 'statValue', label: 'Floating stat — value', type: 'text' },
      { name: 'statLabel', label: 'Floating stat — label', type: 'text' },
    ],
  },
  {
    key: 'whyUs',
    label: 'Why choose us',
    anchor: '#why-us',
    description: 'Heading above the trust pillars and statistics band.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
    ],
  },
  {
    key: 'staff',
    label: 'Staff',
    anchor: '#staff',
    description: 'Heading and disclaimer around the staff cards.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
      { name: 'cta', label: 'Button', type: 'text' },
      { name: 'cardCta', label: 'Card button', type: 'text' },
      { name: 'disclaimer', label: 'Disclaimer', type: 'textarea', rows: 3 },
    ],
  },
  {
    key: 'trust',
    label: 'Trust & verification',
    anchor: '#trust',
    description: 'The objection-handling section. Only claim checks you actually carry out.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'ctaPrimary', label: 'Primary button', type: 'text' },
      { name: 'ctaSecondary', label: 'Secondary button', type: 'text' },
      { name: 'note', label: 'Footnote', type: 'textarea', rows: 3 },
    ],
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    anchor: '#testimonials',
    description: 'Heading above the review carousel.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
    ],
  },
  {
    key: 'cities',
    label: 'Cities',
    anchor: '#cities',
    description: 'Coverage section. The cities themselves are managed separately.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
      { name: 'cardCtaPrefix', label: 'Card button prefix', type: 'text', hint: 'Followed by the city name.' },
      { name: 'outsidePrefix', label: 'Footer line — before the link', type: 'text' },
      { name: 'outsideLink', label: 'Footer line — link text', type: 'text' },
      { name: 'outsideSuffix', label: 'Footer line — after the link', type: 'text' },
    ],
  },
  {
    key: 'faq',
    label: 'FAQs',
    anchor: '#faqs',
    description: 'Heading and help panel. The questions are managed under FAQs.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
      { name: 'helpTitle', label: 'Help panel title', type: 'text' },
      { name: 'helpText', label: 'Help panel text', type: 'textarea', rows: 2 },
      { name: 'ctaWhatsapp', label: 'WhatsApp button', type: 'text' },
      { name: 'ctaBook', label: 'Booking button', type: 'text' },
    ],
  },
  {
    key: 'cta',
    label: 'Closing CTA band',
    description: 'The final conversion push before the contact details.',
    fields: [
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
      { name: 'primary', label: 'Primary button', type: 'text' },
      { name: 'whatsapp', label: 'WhatsApp button', type: 'text' },
      { name: 'callback', label: 'Callback button', type: 'text' },
      { name: 'note', label: 'Reassurance line', type: 'text' },
    ],
  },
  {
    key: 'contact',
    label: 'Contact',
    anchor: '#contact',
    description: 'Labels around your contact details. The details themselves are under Settings.',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
      { name: 'callLabel', label: 'Phone card label', type: 'text' },
      { name: 'whatsappLabel', label: 'WhatsApp card label', type: 'text' },
      { name: 'emailLabel', label: 'Email card label', type: 'text' },
      { name: 'emailNote', label: 'Email card note', type: 'text' },
      { name: 'hoursTitle', label: 'Hours heading', type: 'text' },
      { name: 'areasTitle', label: 'Service areas heading', type: 'text' },
      { name: 'areasNote', label: 'Service areas note', type: 'text' },
      { name: 'callbackTitle', label: 'Callback panel heading', type: 'text' },
      { name: 'callbackText', label: 'Callback panel text', type: 'textarea', rows: 2 },
      { name: 'callbackCta', label: 'Callback button', type: 'text' },
      { name: 'bookCta', label: 'Booking button', type: 'text' },
    ],
  },
];

export function CopyPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const doc = useSiteDoc(SITE_DOCS.copy, defaultCopy);
  const [open, setOpen] = useState('hero');

  const save = async () => {
    try {
      await doc.save({ actor: profile, summary: 'Updated page copy' });
      toast.success('Copy saved — the live site is updated.');
    } catch (error) {
      toast.error('Could not save.', { detail: error.message });
    }
  };

  if (doc.loading) {
    return (
      <>
        <PageHeader breadcrumb="Content" title="Page copy" />
        <Card>
          <LoadingPanel />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb="Content"
        title="Page copy"
        description="Every word on the public site, in the order it appears."
        actions={
          <Button as="a" href="/" target="_blank" rel="noopener noreferrer" iconRight={ExternalLink}>
            View site
          </Button>
        }
      />

      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const expanded = open === section.key;
          const values = doc.draft[section.key] || {};

          return (
            <Card key={section.key}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : section.key)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
                aria-expanded={expanded}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {section.label}
                  </span>
                  <span className="block truncate text-[13px] text-slate-500 dark:text-slate-400">
                    {section.description}
                  </span>
                </span>
                <span className="shrink-0 text-slate-400" aria-hidden="true">
                  {expanded ? '▲' : '▼'}
                </span>
              </button>

              {expanded && (
                <div className="border-t border-slate-200 dark:border-slate-800">
                  <CardBody className="grid gap-5">
                    {section.fields.map((field) => (
                      <CopyField
                        key={field.name}
                        field={field}
                        value={values[field.name]}
                        onChange={(next) =>
                          doc.updatePath(`${section.key}.${field.name}`, next)
                        }
                      />
                    ))}

                    {(section.groups || []).map((group) => (
                      <div
                        key={group.key}
                        className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                      >
                        <p className="mb-4 text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                          {group.label}
                        </p>
                        <div className="grid gap-5">
                          {group.fields.map((field) => (
                            <CopyField
                              key={field.name}
                              field={field}
                              value={values[group.key]?.[field.name]}
                              onChange={(next) =>
                                doc.updatePath(
                                  `${section.key}.${group.key}.${field.name}`,
                                  next
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    {section.anchor && (
                      <a
                        href={`/${section.anchor}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        See this section on the live site
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    )}
                  </CardBody>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <SaveBar
        dirty={doc.dirty}
        saving={doc.saving}
        savedAt={doc.savedAt}
        onSave={save}
        onReset={doc.reset}
        onRestoreDefaults={doc.restoreDefaults}
        restoreLabel="Reset all copy"
      />
    </>
  );
}

function CopyField({ field, value, onChange }) {
  if (field.type === 'list') {
    return (
      <StringListEditor
        label={field.label}
        hint={field.hint}
        value={value || []}
        onChange={onChange}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <Field label={field.label} hint={field.hint}>
        <Textarea
          rows={field.rows || 3}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      </Field>
    );
  }

  return (
    <Field label={field.label} hint={field.hint}>
      <Input value={value ?? ''} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

export default CopyPage;
