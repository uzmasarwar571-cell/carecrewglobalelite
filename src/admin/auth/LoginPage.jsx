/**
 * Sign-in, first-run ownership claim, and the two states where the
 * panel cannot proceed: Firebase unconfigured, and a valid account
 * that is not an administrator.
 */

import { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Mail,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth, readableAuthError } from './AuthProvider';
import { missingFirebaseKeys, firebaseProjectId } from '../../lib/firebase';
import { businessConfig } from '../../config/business';
import { Button, Input, Field, Card, Badge, Spinner } from '../ui/primitives';

/* ── Shared frame ──────────────────────────────────────────── */

function AuthFrame({ title, description, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {businessConfig.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Admin panel</p>
          </div>
        </div>

        <Card className="p-6">
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
          {description && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
          <div className="mt-5">{children}</div>
        </Card>

        {footer && (
          <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">{footer}</div>
        )}
      </div>
    </div>
  );
}

/* ── Sign in ───────────────────────────────────────────────── */

export function LoginPage() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (caught) {
      setError(readableAuthError(caught));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) {
      setError('Enter your email address first, then choose “Forgot password”.');
      return;
    }
    setError('');
    try {
      await resetPassword(email);
      setNotice(`Password reset email sent to ${email.trim()}.`);
    } catch (caught) {
      setError(readableAuthError(caught));
    }
  };

  return (
    <AuthFrame
      title="Sign in"
      description="Only accounts listed as administrators can open this panel."
      footer={
        <a href="/" className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200">
          Back to the website
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email address" htmlFor="admin-email">
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="pl-9"
              placeholder="you@example.com"
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="admin-password">
          <div className="relative">
            <KeyRound
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pl-9"
              placeholder="••••••••"
            />
          </div>
        </Field>

        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-[13px] text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg bg-green-50 p-3 text-[13px] text-green-700 dark:bg-green-500/10 dark:text-green-300">
            {notice}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>
          Sign in
        </Button>

        <button
          type="button"
          onClick={forgot}
          className="w-full text-center text-xs text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
        >
          Forgot password?
        </button>
      </form>
    </AuthFrame>
  );
}

/* ── First run ─────────────────────────────────────────────── */

export function ClaimOwnershipPage() {
  const { user, claimOwnership, signOut } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const claim = async () => {
    setBusy(true);
    setError('');
    try {
      await claimOwnership(name);
    } catch (caught) {
      setError(caught?.message || 'Could not complete setup.');
      setBusy(false);
    }
  };

  return (
    <AuthFrame
      title="Set up your admin account"
      description="No administrator exists for this site yet. Claim ownership to become the first one — this can only be done once."
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-3 text-[13px] dark:bg-slate-800/60">
          <p className="text-slate-500 dark:text-slate-400">Signing in as</p>
          <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">{user?.email}</p>
        </div>

        <Field label="Your name" hint="Shown in the activity log so changes are attributable.">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Hassan"
          />
        </Field>

        <p className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <strong className="font-semibold">Do this now.</strong> Until ownership is claimed, any
          account that can sign in could claim it. Deploy the security rules in{' '}
          <code className="font-mono">firestore.rules</code> first if you have not already.
        </p>

        {error && (
          <p className="rounded-lg bg-rose-50 p-3 text-[13px] text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </p>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={busy}
          onClick={claim}
          iconRight={ArrowRight}
        >
          Claim ownership
        </Button>
        <button
          type="button"
          onClick={signOut}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          Sign in with a different account
        </button>
      </div>
    </AuthFrame>
  );
}

/* ── Not an administrator ──────────────────────────────────── */

export function ForbiddenPage() {
  const { user, signOut } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyUid = async () => {
    try {
      await navigator.clipboard.writeText(user?.uid || '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the id is visible on screen anyway */
    }
  };

  return (
    <AuthFrame
      title="This account is not an administrator"
      description="You are signed in, but no admin record exists for this account."
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
          <p className="mt-0.5 text-[13px] font-medium text-slate-900 dark:text-slate-100">
            {user?.email}
          </p>
          <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">User ID</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1 font-mono text-[11px] text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {user?.uid}
            </code>
            <Button size="xs" icon={copied ? Check : Copy} onClick={copyUid}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
          Ask an existing owner to add you under <strong>Team</strong>, or add the record yourself
          in the Firebase console at{' '}
          <code className="font-mono text-xs">admins/{user?.uid}</code> with fields{' '}
          <code className="font-mono text-xs">email</code>,{' '}
          <code className="font-mono text-xs">name</code> and{' '}
          <code className="font-mono text-xs">role</code>.
        </p>

        <Button variant="secondary" className="w-full" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </AuthFrame>
  );
}

/* ── Firebase not configured ───────────────────────────────── */

export function SetupPage() {
  return (
    <AuthFrame
      title="Firebase is not configured"
      description="The admin panel stores everything in Firebase. Add your project credentials to get started."
    >
      <ol className="space-y-3 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
        <li className="flex gap-2.5">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            1
          </span>
          <span>
            Create a project at{' '}
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 underline underline-offset-2 dark:text-indigo-400"
            >
              console.firebase.google.com
            </a>{' '}
            and add a Web app.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            2
          </span>
          <span>
            Enable <strong>Authentication → Email/Password</strong>, then create{' '}
            <strong>Firestore Database</strong> and <strong>Storage</strong>.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            3
          </span>
          <span>
            Copy <code className="font-mono text-xs">.env.example</code> to{' '}
            <code className="font-mono text-xs">.env</code>, paste in the config values, and restart
            the dev server.
          </span>
        </li>
      </ol>

      {missingFirebaseKeys.length > 0 && (
        <div className="mt-5 rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            Missing environment variables
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {missingFirebaseKeys.map((key) => (
              <li key={key} className="font-mono text-[11px] text-amber-700 dark:text-amber-400">
                {key}
              </li>
            ))}
          </ul>
        </div>
      )}

      {firebaseProjectId && (
        <p className="mt-4 text-xs text-slate-500">
          Detected project: <Badge tone="indigo">{firebaseProjectId}</Badge>
        </p>
      )}
    </AuthFrame>
  );
}

/* ── Loading ───────────────────────────────────────────────── */

export function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
      <Spinner className="h-6 w-6" />
    </div>
  );
}
