/**
 * ─────────────────────────────────────────────────────────────
 *  RICH FIELD CONTROLS
 * ─────────────────────────────────────────────────────────────
 *  The inputs that make the CMS pleasant rather than merely
 *  functional: an icon browser, a colour picker with contrast
 *  feedback, an image slot with live preview, and two list
 *  editors (ordered bullet lists and free-form tags).
 *
 *  `SchemaField` dispatches on the field type declared in
 *  src/admin/data/schema.js.
 * ─────────────────────────────────────────────────────────────
 */

import { useMemo, useState, useEffect } from 'react';
import {
  Search,
  Plus,
  X,
  GripVertical,
  Trash2,
  Image as ImageIcon,
  Upload,
  Star,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { iconNames, resolveIcon } from '../../lib/icons';
import { isValidHex, contrastGrade } from '../../theme/color';
import { Button, IconButton, Input, Textarea, Select, Field, Toggle, Badge } from './primitives';
import { Modal } from './overlays';

/* ── Icon picker ───────────────────────────────────────────── */

export function IconPicker({ value, onChange, label = 'Icon', hint }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const Current = resolveIcon(value);

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return iconNames;
    return iconNames.filter((name) => name.toLowerCase().includes(term));
  }, [search]);

  return (
    <Field label={label} hint={hint}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center gap-2.5 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm text-slate-900 shadow-sm transition-colors hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:border-slate-600"
      >
        <Current className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
        <span className="truncate">{value || 'Choose an icon'}</span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Choose an icon"
        description={`${iconNames.length} icons available`}
        size="lg"
      >
        <div className="sticky -top-5 z-10 -mx-5 -mt-5 mb-4 bg-white px-5 pb-3 pt-5 dark:bg-slate-900">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search icons…"
              className="pl-9"
            />
          </div>
        </div>

        {matches.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No icon matches “{search}”.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {matches.map((name) => {
              const Icon = resolveIcon(name);
              const selected = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border p-1.5 transition-colors',
                    selected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="w-full truncate text-center text-[9px] leading-tight">{name}</span>
                </button>
              );
            })}
          </div>
        )}
      </Modal>
    </Field>
  );
}

/* ── Colour picker ─────────────────────────────────────────── */

/**
 * Hex input paired with the native colour picker.
 * `against` enables a live WCAG contrast readout, which is what stops
 * a well-meaning brand change from making body text unreadable.
 */
export function ColorField({ value, onChange, label, hint, against, contrastLabel }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const valid = isValidHex(draft);
  const contrast = against && isValidHex(value) && isValidHex(against)
    ? contrastGrade(value, against)
    : null;

  const commit = (next) => {
    setDraft(next);
    if (isValidHex(next)) onChange(next.toUpperCase());
  };

  return (
    <Field label={label} hint={hint} error={valid ? undefined : 'Not a valid hex colour.'}>
      <div className="flex items-center gap-2">
        <label className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-300 shadow-sm dark:border-slate-700">
          <span className="block h-full w-full" style={{ backgroundColor: valid ? draft : '#fff' }} />
          <input
            type="color"
            value={isValidHex(value) ? value : '#000000'}
            onChange={(event) => commit(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`${label} colour picker`}
          />
        </label>
        <Input
          value={draft}
          onChange={(event) => commit(event.target.value)}
          onBlur={() => !valid && setDraft(value)}
          spellCheck={false}
          className="font-mono uppercase"
          invalid={!valid}
        />
      </div>

      {contrast && (
        <p className="mt-1.5 flex items-center gap-2 text-xs">
          <Badge tone={contrast.pass ? 'green' : contrast.ratio >= 3 ? 'amber' : 'rose'}>
            {contrast.grade}
          </Badge>
          <span className="text-slate-500 dark:text-slate-400">
            {contrast.ratio.toFixed(2)}:1 {contrastLabel || 'contrast'}
          </span>
        </p>
      )}
    </Field>
  );
}

/* ── Image field ───────────────────────────────────────────── */

/**
 * A URL field with a preview. `onBrowse` (supplied by pages that have
 * the media library available) opens the uploader; without it the
 * field still works as a plain URL input.
 */
export function ImageField({ value, onChange, label, hint, onBrowse, ratio = '16 / 10' }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [value]);

  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div
          className="relative w-full shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:w-40 dark:border-slate-800 dark:bg-slate-800"
          style={{ aspectRatio: ratio }}
        >
          {value && !broken ? (
            <img
              src={value}
              alt=""
              onError={() => setBroken(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-slate-400">
              <ImageIcon className="h-6 w-6" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Input
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://… or /images/photo.jpg"
            spellCheck={false}
          />
          <div className="flex flex-wrap gap-2">
            {onBrowse && (
              <Button size="sm" icon={Upload} onClick={onBrowse} type="button">
                Media library
              </Button>
            )}
            {value && (
              <Button size="sm" variant="ghost" icon={X} onClick={() => onChange('')} type="button">
                Clear
              </Button>
            )}
          </div>
          {broken && value && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              That image could not be loaded — check the URL.
            </p>
          )}
        </div>
      </div>
    </Field>
  );
}

/* ── List editors ──────────────────────────────────────────── */

/** Ordered, reorderable list of sentences (bullet points). */
export function StringListEditor({ value = [], onChange, label, hint, placeholder = 'Add an item…' }) {
  const [draft, setDraft] = useState('');
  const list = Array.isArray(value) ? value : [];

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...list, text]);
    setDraft('');
  };

  const update = (index, text) => {
    const next = [...list];
    next[index] = text;
    onChange(next);
  };

  const remove = (index) => onChange(list.filter((_, i) => i !== index));

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {list.map((item, index) => (
          <div key={index} className="flex items-start gap-1.5">
            <div className="flex flex-col pt-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
                className="px-1 text-xs leading-none text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === list.length - 1}
                aria-label="Move down"
                className="px-1 text-xs leading-none text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
              >
                ▼
              </button>
            </div>
            <Input value={item} onChange={(event) => update(index, event.target.value)} />
            <IconButton
              icon={Trash2}
              label="Remove"
              size="sm"
              onClick={() => remove(index)}
              className="mt-0.5 shrink-0 text-slate-400 hover:text-rose-600"
            />
          </div>
        ))}

        <div className="flex items-center gap-1.5">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                add();
              }
            }}
            placeholder={placeholder}
          />
          <IconButton icon={Plus} label="Add item" size="sm" variant="subtle" onClick={add} />
        </div>
      </div>
    </Field>
  );
}

/** Compact chips for short values — languages, areas, options. */
export function TagsEditor({ value = [], onChange, label, hint, placeholder = 'Type and press Enter' }) {
  const [draft, setDraft] = useState('');
  const list = Array.isArray(value) ? value : [];

  const add = () => {
    const text = draft.trim();
    if (!text || list.includes(text)) {
      setDraft('');
      return;
    }
    onChange([...list, text]);
    setDraft('');
  };

  return (
    <Field label={label} hint={hint}>
      <div className="rounded-lg border border-slate-300 bg-white p-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/40">
        {list.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {list.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 py-1 pl-2.5 pr-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onChange(list.filter((_, i) => i !== index))}
                  aria-label={`Remove ${tag}`}
                  className="grid h-4 w-4 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={add}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              add();
            }
            if (event.key === 'Backspace' && !draft && list.length) {
              onChange(list.slice(0, -1));
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>
    </Field>
  );
}

/* ── Star rating ───────────────────────────────────────────── */

export function RatingField({ value = 5, onChange, label = 'Rating' }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'h-5 w-5',
                star <= Number(value)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-600'
              )}
              aria-hidden="true"
            />
          </button>
        ))}
        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{value} of 5</span>
      </div>
    </Field>
  );
}

/* ── Schema dispatcher ─────────────────────────────────────── */

/**
 * Renders one field from a content schema.
 * Keeping the switch here means a new field type is added in exactly
 * two places: the schema, and this function.
 */
export function SchemaField({ field, value, onChange, error, onBrowseMedia }) {
  const id = `field-${field.name}`;
  const common = { label: field.label, hint: field.hint };

  switch (field.type) {
    case 'textarea':
      return (
        <Field {...common} error={error} required={field.required} htmlFor={id}>
          <Textarea
            id={id}
            rows={field.rows || 4}
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      );

    case 'number':
      return (
        <Field {...common} error={error} required={field.required} htmlFor={id}>
          <Input
            id={id}
            type="number"
            min={field.min}
            max={field.max}
            value={value ?? ''}
            onChange={(event) =>
              onChange(event.target.value === '' ? '' : Number(event.target.value))
            }
          />
        </Field>
      );

    case 'select':
      return (
        <Field {...common} error={error} required={field.required} htmlFor={id}>
          <Select id={id} value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
            <option value="">Not set</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
      );

    case 'toggle':
      return (
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <Toggle
            id={id}
            checked={Boolean(value)}
            onChange={onChange}
            label={field.label}
            description={field.hint}
          />
        </div>
      );

    case 'icon':
      return <IconPicker value={value} onChange={onChange} {...common} />;

    case 'image':
      return (
        <ImageField
          value={value}
          onChange={onChange}
          {...common}
          onBrowse={onBrowseMedia ? () => onBrowseMedia(onChange) : undefined}
        />
      );

    case 'stringList':
      return <StringListEditor value={value} onChange={onChange} {...common} />;

    case 'tags':
      return <TagsEditor value={value} onChange={onChange} {...common} />;

    case 'rating':
      return <RatingField value={value} onChange={onChange} label={field.label} />;

    case 'color':
      return <ColorField value={value} onChange={onChange} {...common} />;

    default:
      return (
        <Field {...common} error={error} required={field.required} htmlFor={id}>
          <Input
            id={id}
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder}
          />
        </Field>
      );
  }
}

/* ── Repeater ──────────────────────────────────────────────── */

/**
 * Edits an array of objects (process steps, trust pillars, …).
 * Each row is collapsible so a six-item list stays scannable.
 */
export function Repeater({
  items = [],
  onChange,
  fields,
  titleField,
  addLabel = 'Add item',
  makeEmpty,
}) {
  const [openIndex, setOpenIndex] = useState(null);
  const list = Array.isArray(items) ? items : [];

  const updateItem = (index, patch) => {
    const next = [...list];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((item, position) => ({ ...item, order: position })));
    setOpenIndex(target);
  };

  const remove = (index) => {
    onChange(list.filter((_, i) => i !== index).map((item, position) => ({ ...item, order: position })));
    setOpenIndex(null);
  };

  const add = () => {
    const next = [...list, { ...makeEmpty(list.length), order: list.length }];
    onChange(next);
    setOpenIndex(next.length - 1);
  };

  return (
    <div className="space-y-2">
      {list.map((item, index) => {
        const open = openIndex === index;
        const Icon = item.iconName ? resolveIcon(item.iconName) : null;
        return (
          <div
            key={item.id || index}
            className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 dark:bg-slate-900/60">
              <GripVertical className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              {Icon && (
                <Icon className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              )}
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className="min-w-0 flex-1 truncate text-left text-[13px] font-medium text-slate-800 dark:text-slate-200"
              >
                {item[titleField] || `Item ${index + 1}`}
              </button>
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="px-1.5 text-xs text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === list.length - 1}
                  aria-label="Move down"
                  className="px-1.5 text-xs text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
                >
                  ▼
                </button>
                <IconButton
                  icon={Trash2}
                  label="Remove"
                  size="xs"
                  onClick={() => remove(index)}
                  className="ml-1 text-slate-400 hover:text-rose-600"
                />
              </div>
            </div>

            {open && (
              <div className="grid gap-4 border-t border-slate-200 p-4 dark:border-slate-800">
                {fields.map((field) => (
                  <SchemaField
                    key={field.name}
                    field={field}
                    value={item[field.name]}
                    onChange={(next) => updateItem(index, { [field.name]: next })}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <Button type="button" size="sm" icon={Plus} onClick={add}>
        {addLabel}
      </Button>
    </div>
  );
}
