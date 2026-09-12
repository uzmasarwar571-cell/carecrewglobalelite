/**
 * ─────────────────────────────────────────────────────────────
 *  TEAM
 * ─────────────────────────────────────────────────────────────
 *  Who may sign in, and what they may do.
 *
 *  Note on how accounts are created: this panel grants ACCESS, it
 *  does not create Firebase Auth accounts. Creating one from the
 *  client would sign the current owner out of their own session
 *  (Firebase swaps the active user), and doing it properly needs
 *  the Admin SDK on a server. So the flow is: the person signs up
 *  or is created in the Firebase console, tells you their user ID,
 *  and you grant them a role here.
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus, Trash2, ShieldCheck, Info, Copy, Check } from 'lucide-react';
import { db } from '../../lib/firestore';
import { ADMINS_COLLECTION, ADMIN_ROLES, roleMeta } from '../../lib/collections';
import { useCollection } from '../data/hooks';
import { updateItem, deleteItem, logActivity } from '../data/mutations';
import { useAuth } from '../auth/AuthProvider';
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  IconButton,
  Input,
  Select,
  Field,
  Badge,
  EmptyState,
  LoadingPanel,
  Toggle,
} from '../ui/primitives';
import { Modal, useToast, useConfirmDialog } from '../ui/overlays';

export function TeamPage() {
  const { items, loading } = useCollection(ADMINS_COLLECTION);
  const { profile, user } = useAuth();
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirmDialog();
  const [inviteOpen, setInviteOpen] = useState(false);

  const changeRole = async (admin, role) => {
    if (admin.id === profile?.id && role !== 'owner') {
      toast.error('You cannot remove your own owner role.', {
        detail: 'Ask another owner to change it, so the site is never left without one.',
      });
      return;
    }
    try {
      await updateItem(
        ADMINS_COLLECTION,
        admin.id,
        { role },
        { actor: profile, summary: `Changed ${admin.name || admin.email} to ${roleMeta(role).label}` }
      );
      toast.success('Role updated.');
    } catch (error) {
      toast.error('Could not change the role.', { detail: error.message });
    }
  };

  const toggleDisabled = async (admin) => {
    if (admin.id === profile?.id) {
      toast.error('You cannot disable your own account.');
      return;
    }
    try {
      await updateItem(
        ADMINS_COLLECTION,
        admin.id,
        { disabled: !admin.disabled },
        {
          actor: profile,
          summary: `${admin.disabled ? 'Re-enabled' : 'Disabled'} ${admin.name || admin.email}`,
        }
      );
    } catch (error) {
      toast.error('Could not update the account.', { detail: error.message });
    }
  };

  const remove = async (admin) => {
    if (admin.id === profile?.id) {
      toast.error('You cannot remove your own access.');
      return;
    }
    const owners = items.filter((item) => item.role === 'owner' && !item.disabled);
    if (admin.role === 'owner' && owners.length <= 1) {
      toast.error('This is the last owner.', {
        detail: 'Promote someone else to owner first, or the site would be left unmanageable.',
      });
      return;
    }

    const ok = await confirm({
      title: `Remove ${admin.name || admin.email}?`,
      message:
        'They will lose access to this panel immediately. Their Firebase account is not deleted — remove that separately in the Firebase console if needed.',
      confirmLabel: 'Remove access',
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteItem(ADMINS_COLLECTION, admin.id, {
        actor: profile,
        summary: `Removed admin access for ${admin.name || admin.email}`,
      });
      toast.success('Access removed.');
    } catch (error) {
      toast.error('Could not remove access.', { detail: error.message });
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb="Administration"
        title="Team"
        description="Who can sign in to this panel, and what each person is allowed to change."
        actions={
          <Button variant="primary" icon={UserPlus} onClick={() => setInviteOpen(true)}>
            Grant access
          </Button>
        }
      />

      <Card className="mb-4">
        <CardBody className="flex gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <div className="min-w-0 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              Roles are enforced by the Firestore security rules as well as by this interface, so a
              Staff-role account cannot change content even by calling the database directly.
            </p>
            <ul className="mt-2 space-y-1">
              {ADMIN_ROLES.map((role) => (
                <li key={role.id} className="flex gap-2">
                  <Badge tone={role.id === 'owner' ? 'indigo' : 'slate'}>{role.label}</Badge>
                  <span className="text-slate-500 dark:text-slate-400">{role.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardBody>
      </Card>

      <Card>
        {loading ? (
          <LoadingPanel />
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No administrators listed"
            description="That should not be possible while you are signed in — check the security rules have been deployed."
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((admin) => {
              const isSelf = admin.id === profile?.id;
              return (
                <li key={admin.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-200 text-[11px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {(admin.name || admin.email || '?').slice(0, 2)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-[13px] font-medium text-slate-900 dark:text-slate-100">
                      {admin.name || admin.email}
                      {isSelf && <Badge tone="indigo">You</Badge>}
                      {admin.disabled && <Badge tone="rose">Disabled</Badge>}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {admin.email}
                    </p>
                  </div>

                  <Select
                    value={admin.role || 'staff'}
                    onChange={(event) => changeRole(admin, event.target.value)}
                    className="h-8 w-auto min-w-[7rem] text-xs"
                    aria-label={`Role for ${admin.name || admin.email}`}
                  >
                    {ADMIN_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.label}
                      </option>
                    ))}
                  </Select>

                  <div className="flex items-center gap-1">
                    <Button size="xs" variant="ghost" onClick={() => toggleDisabled(admin)} disabled={isSelf}>
                      {admin.disabled ? 'Enable' : 'Disable'}
                    </Button>
                    <IconButton
                      icon={Trash2}
                      label="Remove access"
                      size="sm"
                      disabled={isSelf}
                      onClick={() => remove(admin)}
                      className="text-slate-400 hover:text-rose-600"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <GrantAccessModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        existingIds={items.map((item) => item.id)}
        actor={profile}
        currentUid={user?.uid}
      />

      {confirmDialog}
    </>
  );
}

/* ── Grant access ──────────────────────────────────────────── */

function GrantAccessModal({ open, onClose, existingIds, actor, currentUid }) {
  const toast = useToast();
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('editor');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setUid('');
    setEmail('');
    setName('');
    setRole('editor');
    setError('');
  };

  const grant = async () => {
    const trimmed = uid.trim();
    if (!trimmed) {
      setError('The user ID is required.');
      return;
    }
    if (existingIds.includes(trimmed)) {
      setError('That account already has access.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await setDoc(doc(db, ADMINS_COLLECTION, trimmed), {
        email: email.trim() || null,
        name: name.trim() || email.trim() || trimmed,
        role,
        disabled: false,
        createdAt: serverTimestamp(),
        createdBy: actor?.id || null,
      });
      await logActivity({
        actor,
        action: 'create',
        target: `${ADMINS_COLLECTION}/${trimmed}`,
        summary: `Granted ${roleMeta(role).label} access to ${name || email || trimmed}`,
      });
      toast.success('Access granted.');
      reset();
      onClose();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
    }
  };

  const copyUid = async () => {
    try {
      await navigator.clipboard.writeText(currentUid || '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Grant admin access"
      description="Give an existing Firebase account permission to use this panel."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={busy} onClick={grant}>
            Grant access
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          <p className="font-medium text-slate-800 dark:text-slate-200">First, they need an account</p>
          <p className="mt-1">
            In the Firebase console, open <strong>Authentication → Users → Add user</strong> and
            create them an email/password account. Firebase shows a <strong>User UID</strong> — paste
            it below.
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Accounts are not created from here on purpose: doing so from the browser would sign you
            out of your own session.
          </p>
        </div>

        <Field label="User ID (UID)" required hint="From Firebase console → Authentication → Users.">
          <Input
            value={uid}
            onChange={(event) => setUid(event.target.value)}
            placeholder="e.g. 7bQ2m…"
            spellCheck={false}
            className="font-mono text-xs"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="them@example.com"
            />
          </Field>
          <Field label="Name" hint="Shown in the activity log.">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
        </div>

        <Field label="Role">
          <Select value={role} onChange={(event) => setRole(event.target.value)}>
            {ADMIN_ROLES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {roleMeta(role).description}
          </p>
        </Field>

        {error && (
          <p className="rounded-lg bg-rose-50 p-3 text-[13px] text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="flex items-center gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>Your own UID:</span>
          <code className="truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] dark:bg-slate-800">
            {currentUid}
          </code>
          <Button size="xs" variant="ghost" icon={copied ? Check : Copy} onClick={copyUid}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default TeamPage;
