/**
 * Privacy Policy and Terms editing.
 *
 * The bundled wording is a placeholder describing how the site
 * actually behaves — it is not legal advice, and the page says so
 * until the owner switches the notice off.
 */

import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Scale, AlertTriangle } from 'lucide-react';
import { defaultLegal } from '../../data/legal';
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
  Badge,
  LoadingPanel,
} from '../ui/primitives';
import { SaveBar } from '../ui/SaveBar';
import { useToast } from '../ui/overlays';

const DOCUMENTS = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms & Conditions' },
];

const TOKENS = ['{business}', '{email}', '{phone}'];

export function LegalPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const doc = useSiteDoc(SITE_DOCS.legal, defaultLegal);
  const [tab, setTab] = useState('privacy');

  const current = doc.draft[tab] || { sections: [] };
  const sections = current.sections || [];

  const setSections = (next) => doc.updatePath(`${tab}.sections`, next);

  const updateSection = (index, patch) => {
    const next = [...sections];
    next[index] = { ...next[index], ...patch };
    setSections(next);
  };

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  };

  const save = async () => {
    try {
      await doc.save({ actor: profile, summary: 'Updated legal documents' });
      toast.success('Legal documents saved.');
    } catch (error) {
      toast.error('Could not save.', { detail: error.message });
    }
  };

  if (doc.loading) {
    return (
      <>
        <PageHeader breadcrumb="Content" title="Legal pages" />
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
        title="Legal pages"
        description="The Privacy Policy and Terms shown in the footer dialogs."
      />

      <Card className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/5">
        <div className="flex gap-3 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-amber-900 dark:text-amber-200">
              This is placeholder wording, not legal advice
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-amber-800 dark:text-amber-300">
              The bundled text describes how this website currently behaves. Have it reviewed by a
              legal professional for your jurisdiction, replace it here, then switch off the notice
              visitors see.
            </p>
            <div className="mt-3 rounded-lg border border-amber-300/60 bg-white/60 p-3 dark:border-amber-500/30 dark:bg-slate-900/40">
              <Toggle
                id="draft-notice"
                checked={doc.draft.showDraftNotice !== false}
                onChange={(value) => doc.update({ showDraftNotice: value })}
                label="Show the “draft — pending review” notice to visitors"
                description="Leave this on until the wording has been reviewed."
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={DOCUMENTS} />

        <CardBody className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Document title">
              <Input
                value={current.title || ''}
                onChange={(event) => doc.updatePath(`${tab}.title`, event.target.value)}
              />
            </Field>
            <Field label="Status line" hint="Shown under the title, e.g. “Last updated May 2026”.">
              <Input
                value={current.updated || ''}
                onChange={(event) => doc.updatePath(`${tab}.updated`, event.target.value)}
              />
            </Field>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                Sections
              </p>
              <span className="text-xs text-slate-400">Placeholders:</span>
              {TOKENS.map((token) => (
                <Badge key={token} tone="indigo">
                  <code className="font-mono">{token}</code>
                </Badge>
              ))}
            </div>

            <div className="space-y-3">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Scale className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <Input
                      value={section.heading || ''}
                      onChange={(event) => updateSection(index, { heading: event.target.value })}
                      placeholder="Section heading"
                    />
                    <IconButton
                      icon={ArrowUp}
                      label="Move up"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    />
                    <IconButton
                      icon={ArrowDown}
                      label="Move down"
                      size="sm"
                      disabled={index === sections.length - 1}
                      onClick={() => move(index, 1)}
                    />
                    <IconButton
                      icon={Trash2}
                      label="Remove section"
                      size="sm"
                      className="text-slate-400 hover:text-rose-600"
                      onClick={() => setSections(sections.filter((_, i) => i !== index))}
                    />
                  </div>
                  <Textarea
                    rows={5}
                    value={section.body || ''}
                    onChange={(event) => updateSection(index, { body: event.target.value })}
                    placeholder="Section text…"
                  />
                </div>
              ))}

              <Button
                size="sm"
                icon={Plus}
                onClick={() => setSections([...sections, { heading: '', body: '' }])}
              >
                Add section
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <SaveBar
        dirty={doc.dirty}
        saving={doc.saving}
        savedAt={doc.savedAt}
        onSave={save}
        onReset={doc.reset}
        onRestoreDefaults={doc.restoreDefaults}
        restoreLabel="Restore bundled wording"
      />
    </>
  );
}

export default LegalPage;
