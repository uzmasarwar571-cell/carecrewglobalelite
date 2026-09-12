/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENT BLOCKS
 * ─────────────────────────────────────────────────────────────
 *  The repeating lists that make up the middle of the page: the
 *  process steps, the trust pillars, the verification checklist,
 *  the badge strip under the hero, and the About values.
 *
 *  These live in a single `site/blocks` document rather than five
 *  collections — they are short, always edited together, and
 *  always read together, so one document is one read instead of
 *  five and keeps them consistent.
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { Layers, Info } from 'lucide-react';
import { defaultBlocks } from '../../data/content';
import { SITE_DOCS } from '../../lib/collections';
import { useSiteDoc } from '../data/useSiteDoc';
import { useAuth } from '../auth/AuthProvider';
import { PageHeader, Card, CardBody, Tabs, LoadingPanel, Button } from '../ui/primitives';
import { Repeater } from '../ui/fields';
import { SaveBar } from '../ui/SaveBar';
import { useToast } from '../ui/overlays';

const TEXT = { type: 'text' };
const AREA = { type: 'textarea', rows: 3 };

const GROUPS = [
  {
    key: 'steps',
    label: 'Process steps',
    titleField: 'title',
    description:
      'The “How it works” band. Four steps is the sweet spot — more and the journey stops reading as simple.',
    addLabel: 'Add step',
    fields: [
      { name: 'number', label: 'Step number', ...TEXT, hint: 'Shown in the circle, e.g. “01”.' },
      { name: 'title', label: 'Title', ...TEXT },
      { name: 'description', label: 'Description', ...AREA },
      { name: 'iconName', label: 'Icon', type: 'icon' },
    ],
    makeEmpty: (index) => ({
      id: `step-${Date.now()}`,
      number: String(index + 1).padStart(2, '0'),
      title: '',
      description: '',
      iconName: 'ClipboardList',
    }),
  },
  {
    key: 'reasons',
    label: 'Trust pillars',
    titleField: 'title',
    description: 'The “Why choose us” grid. Works best as a multiple of four.',
    addLabel: 'Add pillar',
    fields: [
      { name: 'title', label: 'Title', ...TEXT },
      { name: 'description', label: 'Description', ...AREA },
      { name: 'iconName', label: 'Icon', type: 'icon' },
    ],
    makeEmpty: () => ({ id: `reason-${Date.now()}`, title: '', description: '', iconName: 'ShieldCheck' }),
  },
  {
    key: 'verificationSteps',
    label: 'Verification checklist',
    titleField: 'title',
    description:
      'What you actually do before recommending someone. Describe only checks you genuinely carry out and can evidence — overstating this is both a legal and a reputational risk.',
    addLabel: 'Add check',
    fields: [
      { name: 'title', label: 'Title', ...TEXT },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
      { name: 'iconName', label: 'Icon', type: 'icon' },
    ],
    makeEmpty: () => ({ id: `verify-${Date.now()}`, title: '', description: '', iconName: 'FileSearch' }),
  },
  {
    key: 'trustBadges',
    label: 'Hero badge strip',
    titleField: 'label',
    description: 'The thin reassurance row directly under the hero. Keep each label to three words.',
    addLabel: 'Add badge',
    fields: [
      { name: 'label', label: 'Label', ...TEXT },
      { name: 'iconName', label: 'Icon', type: 'icon' },
    ],
    makeEmpty: () => ({ id: `badge-${Date.now()}`, label: '', iconName: 'BadgeCheck' }),
  },
  {
    key: 'values',
    label: 'About values',
    titleField: 'title',
    description: 'The bulleted values in the About section.',
    addLabel: 'Add value',
    fields: [
      { name: 'title', label: 'Title', ...TEXT },
      { name: 'description', label: 'Description', ...AREA },
    ],
    makeEmpty: () => ({ id: `value-${Date.now()}`, title: '', description: '' }),
  },
];

export function BlocksPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const doc = useSiteDoc(SITE_DOCS.blocks, defaultBlocks);
  const [tab, setTab] = useState(GROUPS[0].key);

  const group = GROUPS.find((item) => item.key === tab) || GROUPS[0];

  const save = async () => {
    try {
      await doc.save({ actor: profile, summary: 'Updated content blocks' });
      toast.success('Blocks saved.');
    } catch (error) {
      toast.error('Could not save.', { detail: error.message });
    }
  };

  if (doc.loading) {
    return (
      <>
        <PageHeader breadcrumb="Content" title="Content blocks" />
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
        title="Content blocks"
        description="The repeating lists that make up the middle of the page."
      />

      <Card>
        <Tabs
          className="px-3"
          value={tab}
          onChange={setTab}
          tabs={GROUPS.map((item) => ({
            id: item.key,
            label: item.label,
            count: (doc.draft[item.key] || []).length,
          }))}
        />

        <CardBody>
          <div className="mb-5 flex gap-2.5 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
              {group.description}
            </p>
          </div>

          <Repeater
            items={doc.draft[group.key] || []}
            onChange={(next) => doc.update({ [group.key]: next })}
            fields={group.fields}
            titleField={group.titleField}
            addLabel={group.addLabel}
            makeEmpty={group.makeEmpty}
          />

          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button
              size="sm"
              variant="ghost"
              icon={Layers}
              onClick={() => doc.update({ [group.key]: defaultBlocks[group.key] })}
            >
              Restore the default {group.label.toLowerCase()}
            </Button>
          </div>
        </CardBody>
      </Card>

      <SaveBar
        dirty={doc.dirty}
        saving={doc.saving}
        savedAt={doc.savedAt}
        onSave={save}
        onReset={doc.reset}
      />
    </>
  );
}

export default BlocksPage;
