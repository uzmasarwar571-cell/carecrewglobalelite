/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENT COLLECTION EDITOR
 * ─────────────────────────────────────────────────────────────
 *  One component serves services, staff, cities, testimonials and
 *  FAQs. The differences between them live in the schemas
 *  (src/admin/data/schema.js), not in five near-identical pages —
 *  so a fix to reordering or validation lands everywhere at once.
 * ─────────────────────────────────────────────────────────────
 */

import { useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Pencil,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { getSchema, emptyRecord, validateRecord } from '../data/schema';
import { useOrderedCollection } from '../data/hooks';
import {
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
  slugify,
  bulkSet,
  toWritablePayload,
} from '../data/mutations';
import { bundledDefaults } from '../data/seed';
import { useAuth } from '../auth/AuthProvider';
import { resolveIcon } from '../../lib/icons';
import {
  PageHeader,
  Card,
  Button,
  IconButton,
  Input,
  Badge,
  EmptyState,
  LoadingPanel,
} from '../ui/primitives';
import { Drawer, useToast, useConfirmDialog } from '../ui/overlays';
import { SchemaField } from '../ui/fields';
import { MediaBrowser } from './MediaPage';

export function CollectionPage() {
  const { collectionKey } = useParams();
  const schema = getSchema(collectionKey);
  const { profile, can } = useAuth();
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirmDialog();

  const { items, loading } = useOrderedCollection(schema?.path);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // { record, isNew }
  const [mediaTarget, setMediaTarget] = useState(null);

  const filtered = useMemo(() => {
    if (!schema) return [];
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item[schema.titleField], item[schema.subtitleField], item.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [items, search, schema]);

  if (!schema) return <Navigate to="/admin/404" replace />;

  const startNew = () => setEditing({ record: emptyRecord(schema), isNew: true });

  const save = async (record, isNew) => {
    const errors = validateRecord(schema, record);
    if (Object.keys(errors).length) return errors;

    const payload = toWritablePayload(record);

    try {
      if (isNew) {
        const id = slugify(record[schema.slugFrom] || record[schema.titleField], schema.key);
        if (items.some((item) => item.id === id)) {
          return { [schema.slugFrom]: 'Something with that name already exists.' };
        }
        await createItem(schema.path, id, { ...payload, order: items.length }, { actor: profile });
        toast.success(`${schema.singular} created.`);
      } else {
        await updateItem(schema.path, record.id, payload, { actor: profile });
        toast.success('Saved.');
      }
      setEditing(null);
      return null;
    } catch (error) {
      toast.error('Could not save.', { detail: error.message });
      return { _form: error.message };
    }
  };

  const togglePublished = async (item) => {
    try {
      await updateItem(
        schema.path,
        item.id,
        { published: item.published === false },
        {
          actor: profile,
          summary: `${item.published === false ? 'Published' : 'Unpublished'} ${
            item[schema.titleField]
          }`,
        }
      );
    } catch (error) {
      toast.error('Could not change visibility.', { detail: error.message });
    }
  };

  const duplicate = async (item) => {
    const rest = toWritablePayload(item);
    const title = `${rest[schema.titleField]} (copy)`;
    try {
      await createItem(
        schema.path,
        slugify(title, schema.key),
        { ...rest, [schema.titleField]: title, published: false, order: items.length },
        { actor: profile }
      );
      toast.success('Duplicated as an unpublished draft.');
    } catch (error) {
      toast.error('Could not duplicate.', { detail: error.message });
    }
  };

  const remove = async (item) => {
    const ok = await confirm({
      title: `Delete “${item[schema.titleField]}”?`,
      message: 'This removes it from the website permanently. Consider unpublishing instead.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteItem(schema.path, item.id, {
        actor: profile,
        summary: `Deleted ${schema.singular.toLowerCase()} “${item[schema.titleField]}”`,
      });
      toast.success('Deleted.');
    } catch (error) {
      toast.error('Could not delete.', { detail: error.message });
    }
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await reorderItems(schema.path, next.map((item) => item.id), { actor: profile });
    } catch (error) {
      toast.error('Could not reorder.', { detail: error.message });
    }
  };

  const restoreDefaults = async () => {
    const ok = await confirm({
      title: `Restore the default ${schema.label.toLowerCase()}?`,
      message:
        'This rewrites every record in this collection with the content that ships in the code. Anything you have changed here will be lost.',
      confirmLabel: 'Restore defaults',
      destructive: true,
    });
    if (!ok) return;
    try {
      await bulkSet(schema.path, bundledDefaults.collections[schema.path], {
        actor: profile,
        summary: `Restored default ${schema.label}`,
      });
      toast.success('Defaults restored.');
    } catch (error) {
      toast.error('Could not restore defaults.', { detail: error.message });
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb="Content"
        title={schema.label}
        description={schema.description}
        actions={
          <>
            {can('delete') && (
              <Button icon={RotateCcw} onClick={restoreDefaults}>
                Restore defaults
              </Button>
            )}
            <Button variant="primary" icon={Plus} onClick={startNew}>
              New {schema.singular.toLowerCase()}
            </Button>
          </>
        }
      />

      <Card>
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="relative max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${schema.label.toLowerCase()}…`}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <LoadingPanel />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={schema.icon}
            title={items.length ? 'Nothing matches that search' : `No ${schema.label.toLowerCase()} yet`}
            description={
              items.length
                ? 'Try a different term.'
                : `Add your first ${schema.singular.toLowerCase()}, or import the bundled content from the Overview page.`
            }
            action={
              !items.length && (
                <Button variant="primary" icon={Plus} onClick={startNew}>
                  New {schema.singular.toLowerCase()}
                </Button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((item) => {
              const index = items.indexOf(item);
              const Icon = schema.iconField ? resolveIcon(item[schema.iconField]) : schema.icon;
              const image = schema.imageField ? item[schema.imageField] : null;
              const hidden = item.published === false;

              return (
                <li
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40',
                    hidden && 'opacity-60'
                  )}
                >
                  {/* Reorder — disabled while a search is filtering the list,
                      since positions would be relative to the wrong set. */}
                  <div className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={Boolean(search) || index === 0}
                      aria-label="Move up"
                      className="px-1 text-slate-300 transition-colors hover:text-slate-600 disabled:opacity-30 dark:text-slate-600 dark:hover:text-slate-300"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={Boolean(search) || index === items.length - 1}
                      aria-label="Move down"
                      className="px-1 text-slate-300 transition-colors hover:text-slate-600 disabled:opacity-30 dark:text-slate-600 dark:hover:text-slate-300"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setEditing({ record: item, isNew: false })}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-[13px] font-medium text-slate-900 dark:text-slate-100">
                      {item[schema.titleField] || item.id}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {item[schema.subtitleField] || '—'}
                    </p>
                  </button>

                  <div className="hidden shrink-0 sm:block">
                    {hidden ? <Badge tone="slate">Hidden</Badge> : <Badge tone="green">Live</Badge>}
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <IconButton
                      icon={hidden ? Eye : EyeOff}
                      label={hidden ? 'Publish' : 'Unpublish'}
                      size="sm"
                      onClick={() => togglePublished(item)}
                    />
                    <IconButton
                      icon={Pencil}
                      label="Edit"
                      size="sm"
                      onClick={() => setEditing({ record: item, isNew: false })}
                    />
                    <IconButton icon={Copy} label="Duplicate" size="sm" onClick={() => duplicate(item)} />
                    {can('delete') && (
                      <IconButton
                        icon={Trash2}
                        label="Delete"
                        size="sm"
                        onClick={() => remove(item)}
                        className="text-slate-400 hover:text-rose-600"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <RecordEditor
        schema={schema}
        state={editing}
        onClose={() => setEditing(null)}
        onSave={save}
        onBrowseMedia={(apply) => setMediaTarget(() => apply)}
      />

      <MediaBrowser
        open={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        onSelect={(url) => {
          mediaTarget?.(url);
          setMediaTarget(null);
        }}
      />

      {confirmDialog}
    </>
  );
}

/* ── Editor drawer ─────────────────────────────────────────── */

function RecordEditor({ schema, state, onClose, onSave, onBrowseMedia }) {
  const [record, setRecord] = useState(state?.record ?? {});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [openedFor, setOpenedFor] = useState(null);

  // Re-seed the form whenever a different record is opened. Doing this
  // during render (rather than in an effect) means the first paint
  // already shows the right values.
  const key = state ? `${state.isNew ? 'new' : state.record.id}` : null;
  if (key !== openedFor) {
    setOpenedFor(key);
    setRecord(state?.record ?? {});
    setErrors({});
  }

  if (!state) return <Drawer open={false} onClose={onClose} title="" />;

  const submit = async () => {
    setSaving(true);
    const result = await onSave(record, state.isNew);
    setSaving(false);
    if (result) setErrors(result);
  };

  return (
    <Drawer
      open
      onClose={onClose}
      title={state.isNew ? `New ${schema.singular.toLowerCase()}` : record[schema.titleField] || 'Edit'}
      description={state.isNew ? undefined : `Document id: ${record.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={submit}>
            {state.isNew ? `Create ${schema.singular.toLowerCase()}` : 'Save changes'}
          </Button>
        </>
      }
    >
      {errors._form && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-[13px] text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {errors._form}
        </p>
      )}

      <div className="grid gap-5">
        {schema.fields.map((field) => (
          <SchemaField
            key={field.name}
            field={field}
            value={record[field.name]}
            error={errors[field.name]}
            onChange={(value) => {
              setRecord((current) => ({ ...current, [field.name]: value }));
              setErrors((current) => ({ ...current, [field.name]: undefined }));
            }}
            onBrowseMedia={onBrowseMedia}
          />
        ))}
      </div>
    </Drawer>
  );
}

export default CollectionPage;
