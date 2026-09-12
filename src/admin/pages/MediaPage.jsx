/**
 * ─────────────────────────────────────────────────────────────
 *  MEDIA LIBRARY
 * ─────────────────────────────────────────────────────────────
 *  Uploads go to Firebase Storage; a small metadata document is
 *  written to the `media` collection alongside each file so the
 *  library can be listed, searched and captioned without paging
 *  through Storage itself.
 *
 *  `MediaBrowser` is the same library in picker form, reused by
 *  every image field in the CMS.
 * ─────────────────────────────────────────────────────────────
 */

import { useCallback, useRef, useState } from 'react';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
  Image as ImageIcon,
  Copy,
  Trash2,
  Check,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { isFirebaseConfigured } from '../../lib/firebase';
import { db } from '../../lib/firestore';
import { storage } from '../../lib/firebaseStorage';
import { MEDIA_COLLECTION } from '../../lib/collections';
import { useCollection } from '../data/hooks';
import { deleteItem } from '../data/mutations';
import { useAuth } from '../auth/AuthProvider';
import {
  PageHeader,
  Card,
  Button,
  Input,
  EmptyState,
  LoadingPanel,
  Badge,
} from '../ui/primitives';
import { Modal, useToast, useConfirmDialog } from '../ui/overlays';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'image/gif'];

/* ── Upload logic, shared by the page and the picker ───────── */

function useMediaUpload() {
  const { profile } = useAuth();
  const toast = useToast();
  const [uploads, setUploads] = useState([]);

  const upload = useCallback(
    async (files) => {
      const list = Array.from(files || []);
      if (!list.length) return [];

      const results = [];
      for (const file of list) {
        if (!ACCEPTED.includes(file.type)) {
          toast.error(`${file.name} is not a supported image type.`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} is larger than 5 MB.`, {
            detail: 'Compress it first — large hero images slow the site down badly.',
          });
          continue;
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const path = `media/${id}-${file.name.replace(/[^\w.-]/g, '_')}`;
        setUploads((current) => [...current, { id, name: file.name, progress: 0 }]);

        try {
          // eslint-disable-next-line no-await-in-loop -- sequential keeps progress readable
          const url = await new Promise((resolve, reject) => {
            const task = uploadBytesResumable(storageRef(storage, path), file, {
              contentType: file.type,
              cacheControl: 'public, max-age=31536000',
            });
            task.on(
              'state_changed',
              (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setUploads((current) =>
                  current.map((item) => (item.id === id ? { ...item, progress } : item))
                );
              },
              reject,
              () => getDownloadURL(task.snapshot.ref).then(resolve, reject)
            );
          });

          // eslint-disable-next-line no-await-in-loop -- keep metadata in step
          await addDoc(collection(db, MEDIA_COLLECTION), {
            name: file.name,
            path,
            url,
            size: file.size,
            contentType: file.type,
            uploadedBy: profile?.id || null,
            uploadedByName: profile?.name || profile?.email || null,
            createdAt: serverTimestamp(),
          });

          results.push(url);
        } catch (error) {
          toast.error(`Upload failed: ${file.name}`, { detail: error.message });
        } finally {
          setUploads((current) => current.filter((item) => item.id !== id));
        }
      }

      if (results.length) toast.success(`Uploaded ${results.length} file(s).`);
      return results;
    },
    [profile, toast]
  );

  return { upload, uploads };
}

/* ── Drop zone ─────────────────────────────────────────────── */

function DropZone({ onFiles, uploads, compact = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          onFiles(event.dataTransfer.files);
        }}
        className={cn(
          'rounded-xl border-2 border-dashed text-center transition-colors',
          compact ? 'p-5' : 'p-8',
          dragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
            : 'border-slate-300 dark:border-slate-700'
        )}
      >
        <ImageIcon
          className={cn('mx-auto text-slate-400', compact ? 'h-6 w-6' : 'h-8 w-8')}
          aria-hidden="true"
        />
        <p className="mt-2.5 text-[13px] text-slate-600 dark:text-slate-300">
          Drop images here, or{' '}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-medium text-indigo-600 underline underline-offset-2 dark:text-indigo-400"
          >
            browse your files
          </button>
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          JPG, PNG, WebP, AVIF or SVG · up to 5 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          multiple
          className="hidden"
          onChange={(event) => {
            onFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {uploads.length > 0 && (
        <ul className="mt-3 space-y-2">
          {uploads.map((item) => (
            <li key={item.id} className="flex items-center gap-3 text-xs">
              <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300">
                {item.name}
              </span>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-[width]"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <span className="tabular w-9 text-right tabular-nums text-slate-500">
                {item.progress}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Grid ──────────────────────────────────────────────────── */

function MediaGrid({ items, onSelect, onDelete, copiedId, onCopy }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <li
          key={item.id}
          className="group overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <button
            type="button"
            onClick={() => onSelect?.(item.url)}
            className="block aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
            title={onSelect ? 'Use this image' : item.name}
          >
            <img
              src={item.url}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>

          <div className="p-2.5">
            <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-200" title={item.name}>
              {item.name}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              {formatBytes(item.size)}
            </p>

            <div className="mt-2 flex items-center gap-1">
              <Button
                size="xs"
                variant="subtle"
                icon={copiedId === item.id ? Check : Copy}
                onClick={() => onCopy(item)}
                className="flex-1"
              >
                {copiedId === item.id ? 'Copied' : 'Copy URL'}
              </Button>
              {onDelete && (
                <Button
                  size="xs"
                  variant="ghost"
                  icon={Trash2}
                  aria-label={`Delete ${item.name}`}
                  onClick={() => onDelete(item)}
                  className="!px-1.5 text-slate-400 hover:text-rose-600"
                />
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export function MediaPage() {
  const { items, loading } = useCollection(MEDIA_COLLECTION, { order: ['createdAt', 'desc'] });
  const { upload, uploads } = useMediaUpload();
  const { profile, can } = useAuth();
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirmDialog();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filtered = search.trim()
    ? items.filter((item) => item.name?.toLowerCase().includes(search.trim().toLowerCase()))
    : items;

  const copy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.info('Copy blocked by the browser — select the URL manually.');
    }
  };

  const remove = async (item) => {
    const ok = await confirm({
      title: `Delete “${item.name}”?`,
      message:
        'Any page still pointing at this image will show a broken image. This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;

    try {
      // Storage first: an orphaned metadata row is easy to clean up,
      // an orphaned file quietly costs money forever.
      if (item.path) await deleteObject(storageRef(storage, item.path)).catch(() => {});
      await deleteItem(MEDIA_COLLECTION, item.id, {
        actor: profile,
        summary: `Deleted media “${item.name}”`,
      });
      toast.success('Deleted.');
    } catch (error) {
      toast.error('Could not delete.', { detail: error.message });
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb="Appearance"
        title="Media"
        description="Images used across the site. Upload once, then pick them from any image field."
      />

      {!isFirebaseConfigured && (
        <Card className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/5">
          <div className="flex gap-3 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
            <p className="text-[13px] text-amber-800 dark:text-amber-300">
              Firebase Storage is not configured, so uploads are unavailable. You can still paste
              image URLs directly into any image field.
            </p>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <div className="p-4">
          <DropZone onFiles={upload} uploads={uploads} />
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="relative max-w-xs flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search files…"
              className="pl-9"
            />
          </div>
          <Badge tone="slate">{items.length} files</Badge>
        </div>

        <div className="p-4">
          {loading ? (
            <LoadingPanel />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title={items.length ? 'Nothing matches that' : 'No images uploaded yet'}
              description={
                items.length
                  ? 'Try a different filename.'
                  : 'Drop your first image above. Real photographs of your own work make far more difference than any theme change.'
              }
            />
          ) : (
            <MediaGrid
              items={filtered}
              onDelete={can('delete') ? remove : undefined}
              onCopy={copy}
              copiedId={copiedId}
            />
          )}
        </div>
      </Card>

      {confirmDialog}
    </>
  );
}

/* ── Picker ────────────────────────────────────────────────── */

export function MediaBrowser({ open, onClose, onSelect }) {
  const { items, loading } = useCollection(MEDIA_COLLECTION, { order: ['createdAt', 'desc'] });
  const { upload, uploads } = useMediaUpload();
  const [url, setUrl] = useState('');

  const handleUpload = async (files) => {
    const [first] = await upload(files);
    if (first) onSelect(first);
  };

  return (
    <Modal open={open} onClose={onClose} title="Choose an image" size="xl">
      <div className="space-y-4">
        <DropZone onFiles={handleUpload} uploads={uploads} compact />

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label
              htmlFor="media-url"
              className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300"
            >
              …or paste a URL
            </label>
            <Input
              id="media-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://images.example.com/photo.jpg"
            />
          </div>
          <Button
            variant="primary"
            disabled={!url.trim()}
            onClick={() => {
              onSelect(url.trim());
              setUrl('');
            }}
          >
            Use URL
          </Button>
        </div>

        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
          {loading ? (
            <LoadingPanel />
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-slate-500">
              Your media library is empty.
            </p>
          ) : (
            <MediaGrid items={items} onSelect={onSelect} onCopy={() => {}} copiedId={null} />
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ── Helpers ───────────────────────────────────────────────── */

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default MediaPage;
