/**
 * ─────────────────────────────────────────────────────────────
 *  THEME MANAGER
 * ─────────────────────────────────────────────────────────────
 *  Restyles the entire public site without a rebuild.
 *
 *  Two modes, deliberately:
 *   · Simple — pick four anchor colours and the whole scale is
 *     regenerated around them, preserving the lightness curve the
 *     site was designed with so contrast survives the change.
 *   · Advanced — edit any of the 27 individual steps.
 *
 *  Contrast is checked live on the pairs that actually matter, so
 *  a brand change cannot quietly make the site unreadable.
 * ─────────────────────────────────────────────────────────────
 */

import { useMemo, useState } from 'react';
import { Check, Type, Gauge, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  defaultTheme,
  defaultRamps,
  rampAnchors,
  rampMeta,
  themePresets,
  fontPresets,
  mergeTheme,
} from '../../theme/tokens';
import { buildRamp, contrastGrade, readableTextOn } from '../../theme/color';
import { applyTheme } from '../../theme/applyTheme';
import { SITE_DOCS } from '../../lib/collections';
import { useSiteDoc } from '../data/useSiteDoc';
import { useAuth } from '../auth/AuthProvider';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Button,
  Tabs,
  Toggle,
  Field,
  Input,
  Badge,
  LoadingPanel,
} from '../ui/primitives';
import { ColorField } from '../ui/fields';
import { SaveBar } from '../ui/SaveBar';
import { useToast } from '../ui/overlays';

const RAMP_KEYS = ['emerald', 'cream', 'gold', 'charcoal'];

export function ThemePage() {
  const { profile } = useAuth();
  const toast = useToast();
  const doc = useSiteDoc(SITE_DOCS.theme, defaultTheme);
  const [tab, setTab] = useState('colours');
  const [advanced, setAdvanced] = useState(false);

  const theme = useMemo(() => mergeTheme(doc.draft), [doc.draft]);

  /** Regenerates a whole scale from a new anchor colour. */
  const setAnchor = (rampKey, hex) => {
    const ramp = buildRamp(hex, defaultRamps[rampKey], rampAnchors[rampKey]);
    doc.setDraft((current) => {
      const merged = mergeTheme(current);
      return {
        ...merged,
        presetId: 'custom',
        anchors: { ...merged.anchors, [rampKey]: hex },
        ramps: { ...merged.ramps, [rampKey]: ramp },
      };
    });
  };

  const setStop = (rampKey, stop, hex) => {
    doc.setDraft((current) => {
      const merged = mergeTheme(current);
      return {
        ...merged,
        presetId: 'custom',
        ramps: { ...merged.ramps, [rampKey]: { ...merged.ramps[rampKey], [stop]: hex } },
      };
    });
  };

  const applyPreset = (preset) => {
    const ramps = {};
    for (const key of RAMP_KEYS) {
      ramps[key] = buildRamp(preset.anchors[key], defaultRamps[key], rampAnchors[key]);
    }
    doc.setDraft((current) => ({
      ...mergeTheme(current),
      presetId: preset.id,
      anchors: { ...preset.anchors },
      ramps,
    }));
    toast.info(`“${preset.name}” applied — preview it below, then save.`);
  };

  const applyFontPreset = (preset) => {
    doc.setDraft((current) => ({
      ...mergeTheme(current),
      fonts: {
        presetId: preset.id,
        display: preset.display,
        sans: preset.sans,
        googleFonts: preset.googleFonts,
      },
    }));
  };

  const save = async () => {
    try {
      await doc.save({ actor: profile, summary: 'Updated site theme' });
      // Apply immediately so this tab reflects the change too — the
      // public site picks it up through its own live subscription.
      applyTheme(theme);
      toast.success('Theme saved and live.');
    } catch (error) {
      toast.error('Could not save the theme.', { detail: error.message });
    }
  };

  if (doc.loading) {
    return (
      <>
        <PageHeader breadcrumb="Appearance" title="Theme" />
        <Card>
          <LoadingPanel />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb="Appearance"
        title="Theme"
        description="Colours, typography and motion for the public site. Changes here restyle every page at once."
        actions={
          <Button as="a" href="/" target="_blank" rel="noopener noreferrer" iconRight={ExternalLink}>
            View site
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <Card>
            <Tabs
              className="px-3"
              value={tab}
              onChange={setTab}
              tabs={[
                { id: 'colours', label: 'Colours' },
                { id: 'presets', label: 'Presets' },
                { id: 'type', label: 'Typography' },
                { id: 'shape', label: 'Shape & motion' },
              ]}
            />

            <CardBody>
              {tab === 'colours' && (
                <ColourEditor
                  theme={theme}
                  advanced={advanced}
                  setAdvanced={setAdvanced}
                  onAnchor={setAnchor}
                  onStop={setStop}
                />
              )}

              {tab === 'presets' && (
                <PresetPicker theme={theme} onApply={applyPreset} />
              )}

              {tab === 'type' && (
                <TypographyEditor theme={theme} onApply={applyFontPreset} doc={doc} />
              )}

              {tab === 'shape' && <ShapeEditor theme={theme} doc={doc} />}
            </CardBody>
          </Card>
        </div>

        {/* Preview is sticky so it stays visible while scrolling the
            controls — the whole point is watching the effect. */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <ThemePreview theme={theme} />
          <ContrastReport theme={theme} />
        </div>
      </div>

      <SaveBar
        dirty={doc.dirty}
        saving={doc.saving}
        savedAt={doc.savedAt}
        onSave={save}
        onReset={doc.reset}
        onRestoreDefaults={doc.restoreDefaults}
        restoreLabel="Restore original theme"
        message="Theme changes are previewed here. Save to publish them to the live site."
      />
    </>
  );
}

/* ── Colours ───────────────────────────────────────────────── */

function ColourEditor({ theme, advanced, setAdvanced, onAnchor, onStop }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <Toggle
          id="advanced-colours"
          checked={advanced}
          onChange={setAdvanced}
          label="Advanced: edit every step"
          description="Simple mode regenerates each scale from one colour, keeping the lightness curve the site was designed around."
        />
      </div>

      {RAMP_KEYS.map((key) => {
        const meta = rampMeta[key];
        const ramp = theme.ramps[key];
        const anchorStop = rampAnchors[key];

        return (
          <section key={key}>
            <div className="mb-3">
              <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                {meta.label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{meta.description}</p>
            </div>

            {!advanced && (
              <ColorField
                label={`${meta.label} colour`}
                value={theme.anchors[key]}
                onChange={(hex) => onAnchor(key, hex)}
                hint={`Sets step ${anchorStop}; the rest of the scale is derived from it.`}
              />
            )}

            {/* The scale itself, always visible — it is the fastest way
                to see whether a change has flattened the contrast. */}
            <div className="mt-3 flex overflow-hidden rounded-lg">
              {Object.entries(ramp).map(([stop, hex]) => (
                <div
                  key={stop}
                  className="group relative h-12 flex-1"
                  style={{ backgroundColor: hex }}
                  title={`${key}-${stop} · ${hex}`}
                >
                  <span
                    className="absolute inset-x-0 bottom-1 text-center text-[9px] font-medium opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: readableTextOn(hex) }}
                  >
                    {stop}
                  </span>
                </div>
              ))}
            </div>

            {advanced && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(ramp).map(([stop, hex]) => (
                  <ColorField
                    key={stop}
                    label={`${key}-${stop}`}
                    value={hex}
                    onChange={(next) => onStop(key, stop, next)}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

/* ── Presets ───────────────────────────────────────────────── */

function PresetPicker({ theme, onApply }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {themePresets.map((preset) => {
        const active = theme.presetId === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApply(preset)}
            className={cn(
              'rounded-xl border p-4 text-left transition-colors',
              active
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
            )}
          >
            <div className="mb-3 flex gap-1.5">
              {Object.values(preset.anchors).map((hex) => (
                <span
                  key={hex}
                  className="h-8 flex-1 rounded"
                  style={{ backgroundColor: hex }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
              {preset.name}
              {active && <Check className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {preset.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

/* ── Typography ────────────────────────────────────────────── */

function TypographyEditor({ theme, onApply, doc }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3">
        {fontPresets.map((preset) => {
          const active = theme.fonts.presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApply(preset)}
              className={cn(
                'flex items-center gap-4 rounded-xl border p-4 text-left transition-colors',
                active
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
              )}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Type className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                  {preset.name}
                  {active && <Check className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  {preset.note}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <p className="mb-3 text-[13px] font-semibold text-slate-800 dark:text-slate-200">
          Custom pairing
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Display font" hint="Headings.">
            <Input
              value={theme.fonts.display}
              onChange={(event) =>
                doc.updatePath('fonts.display', event.target.value)
              }
            />
          </Field>
          <Field label="Body font" hint="Everything else.">
            <Input
              value={theme.fonts.sans}
              onChange={(event) => doc.updatePath('fonts.sans', event.target.value)}
            />
          </Field>
        </div>
        <Field
          className="mt-4"
          label="Google Fonts query"
          hint="The part after css2? — e.g. family=Inter:wght@400;700. Leave the preset value unless you know what you are changing."
        >
          <Input
            value={theme.fonts.googleFonts}
            spellCheck={false}
            className="font-mono text-xs"
            onChange={(event) => doc.updatePath('fonts.googleFonts', event.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

/* ── Shape & motion ────────────────────────────────────────── */

function ShapeEditor({ theme, doc }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          Corner rounding
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <RangeField
            label="Cards"
            value={theme.radii.card}
            min={0}
            max={36}
            onChange={(value) => doc.updatePath('radii.card', value)}
          />
          <RangeField
            label="Panels"
            value={theme.radii.panel}
            min={0}
            max={48}
            onChange={(value) => doc.updatePath('radii.panel', value)}
          />
        </div>

        <div className="mt-4 flex items-end gap-4">
          <div
            className="h-20 w-28 border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
            style={{ borderRadius: theme.radii.card }}
          />
          <div
            className="h-24 w-36 border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
            style={{ borderRadius: theme.radii.panel }}
          />
        </div>
      </section>

      <section className="border-t border-slate-200 pt-5 dark:border-slate-800">
        <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          <Gauge className="h-4 w-4 text-slate-400" aria-hidden="true" />
          Motion
        </h3>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <Toggle
            id="motion-enabled"
            checked={theme.motion.enabled !== false}
            onChange={(value) => doc.updatePath('motion.enabled', value)}
            label="Animation enabled"
            description="Switching this off removes every scroll reveal, parallax and transition site-wide. Visitors who have asked their device to reduce motion already get this automatically."
          />
        </div>
      </section>
    </div>
  );
}

function RangeField({ label, value, min, max, onChange }) {
  return (
    <Field label={`${label} — ${value}px`}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-indigo-600"
      />
    </Field>
  );
}

/* ── Preview ───────────────────────────────────────────────── */

/**
 * A miniature of the real page composition — dark band, card,
 * buttons, body text. It is drawn with inline styles from the draft
 * theme, so it updates on every keystroke without touching the
 * document's CSS variables (which would restyle the admin too).
 */
function ThemePreview({ theme }) {
  const { emerald, cream, gold, charcoal } = theme.ramps;

  return (
    <Card className="overflow-hidden">
      <CardHeader title="Live preview" description="How the site will look once saved." />
      <div style={{ backgroundColor: cream[50], fontFamily: `"${theme.fonts.sans}", system-ui` }}>
        {/* Dark band */}
        <div style={{ backgroundColor: emerald[950], padding: '20px 18px' }}>
          <span
            style={{
              display: 'inline-block',
              borderRadius: 999,
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 700,
              color: gold[200],
              backgroundColor: `${gold[300]}1F`,
            }}
          >
            Screened &amp; verified staff
          </span>
          <p
            style={{
              margin: '10px 0 0',
              fontFamily: `"${theme.fonts.display}", Georgia, serif`,
              fontSize: 20,
              lineHeight: 1.15,
              fontWeight: 600,
              color: cream[50],
            }}
          >
            Trusted domestic staff in{' '}
            <span style={{ color: gold[300] }}>Pakistan</span>
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 11, lineHeight: 1.5, color: `${cream[200]}BF` }}>
            Reliable, professional and carefully screened help for your home.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <span
              style={{
                borderRadius: 999,
                backgroundColor: gold[400],
                color: emerald[950],
                fontSize: 11,
                fontWeight: 600,
                padding: '7px 14px',
              }}
            >
              Book a Maid
            </span>
            <span
              style={{
                borderRadius: 999,
                border: `1px solid ${cream[50]}40`,
                color: cream[50],
                fontSize: 11,
                fontWeight: 600,
                padding: '7px 14px',
              }}
            >
              Services
            </span>
          </div>
        </div>

        {/* Light body */}
        <div style={{ padding: 18 }}>
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: gold[500],
            }}
          >
            What we provide
          </p>
          <p
            style={{
              margin: '6px 0 0',
              fontFamily: `"${theme.fonts.display}", Georgia, serif`,
              fontSize: 16,
              fontWeight: 600,
              color: emerald[900],
            }}
          >
            Staff for every part of running a home
          </p>

          <div
            style={{
              marginTop: 12,
              borderRadius: theme.radii.card,
              border: `1px solid ${emerald[900]}14`,
              backgroundColor: '#fff',
              padding: 14,
            }}
          >
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                height: 30,
                width: 30,
                borderRadius: 10,
                backgroundColor: `${emerald[700]}12`,
                color: emerald[700],
                fontSize: 13,
              }}
            >
              ✦
            </span>
            <p style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 600, color: emerald[900] }}>
              Full-Time Maid
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 11, lineHeight: 1.5, color: charcoal[500] }}>
              Reliable day-to-day household support for families who need consistent help.
            </p>
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: theme.radii.panel,
              backgroundColor: emerald[900],
              padding: 14,
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: cream[50] }}>
              Ready for reliable help at home?
            </p>
            <span
              style={{
                display: 'inline-block',
                marginTop: 10,
                borderRadius: 999,
                backgroundColor: gold[400],
                color: emerald[950],
                fontSize: 11,
                fontWeight: 600,
                padding: '6px 14px',
              }}
            >
              Get started
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ── Contrast report ───────────────────────────────────────── */

/**
 * Checks the pairs that actually carry meaning on the page. A brand
 * change that drops one of these below AA is the single most common
 * way a themeable site becomes unusable.
 */
function ContrastReport({ theme }) {
  const { emerald, cream, gold, charcoal } = theme.ramps;

  const checks = [
    { label: 'Body text on page', fg: charcoal[500], bg: cream[50] },
    { label: 'Headings on page', fg: emerald[900], bg: cream[50] },
    { label: 'Text on cards', fg: charcoal[500], bg: '#FFFFFF' },
    { label: 'Hero text on dark band', fg: cream[50], bg: emerald[950] },
    { label: 'Accent text on dark band', fg: gold[300], bg: emerald[950] },
    { label: 'Primary button label', fg: cream[50], bg: emerald[700] },
    { label: 'Gold button label', fg: emerald[950], bg: gold[400] },
    { label: 'Link / accent on page', fg: emerald[700], bg: cream[50] },
  ].map((check) => ({ ...check, ...contrastGrade(check.fg, check.bg) }));

  const failing = checks.filter((check) => !check.pass);

  return (
    <Card className="mt-4">
      <CardHeader
        title="Readability"
        description="WCAG contrast for the text pairs this theme controls."
      />
      <CardBody className="space-y-2">
        {failing.length > 0 && (
          <div className="mb-3 flex gap-2.5 rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
              {failing.length} pair{failing.length > 1 ? 's are' : ' is'} below the AA threshold of
              4.5:1. Darken the text colour or lighten its background before saving.
            </p>
          </div>
        )}

        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2.5">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded text-[10px] font-bold"
              style={{ backgroundColor: check.bg, color: check.fg }}
              aria-hidden="true"
            >
              Aa
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-slate-600 dark:text-slate-300">
              {check.label}
            </span>
            <span className="tabular text-xs tabular-nums text-slate-400">
              {check.ratio.toFixed(1)}
            </span>
            <Badge tone={check.pass ? 'green' : check.ratio >= 3 ? 'amber' : 'rose'}>
              {check.grade}
            </Badge>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

export default ThemePage;
