/**
 * ─────────────────────────────────────────────────────────────
 *  ADMIN AUTHENTICATION
 * ─────────────────────────────────────────────────────────────
 *  Signing in with Firebase Auth is only half the check. A valid
 *  Firebase account proves *who* someone is, not that they may
 *  administer this site — anyone can create an account against a
 *  public API key. Authorisation comes from an `admins/{uid}`
 *  document, which the security rules also enforce server-side.
 *
 *  FIRST RUN: no admins exist yet, so the panel offers a one-time
 *  "claim ownership" step. It writes the first admin record and a
 *  `site/security` marker in a single batch; the rules then refuse
 *  every later attempt because that marker exists.
 * ─────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { isFirebaseConfigured } from '../../lib/firebase';
import { db } from '../../lib/firestore';
import { auth } from '../../lib/firebaseAuth';
import { ADMINS_COLLECTION, SITE_COLLECTION, can } from '../../lib/collections';

const AuthContext = createContext(null);

const SECURITY_DOC = 'security';

/** Turns Firebase's error codes into something a human can act on. */
export function readableAuthError(error) {
  const code = error?.code || '';
  const map = {
    'auth/invalid-email': 'That email address is not valid.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
    'auth/network-request-failed': 'Network problem — check your connection.',
    'auth/operation-not-allowed':
      'Email/password sign-in is switched off. Enable it in Firebase console → Authentication → Sign-in method.',
  };
  return map[code] || error?.message || 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(isFirebaseConfigured ? 'loading' : 'unconfigured');
  const [bootstrapNeeded, setBootstrapNeeded] = useState(false);

  /* Firebase account → local user state. */
  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setStatus('signed-out');
      }
    });
  }, []);

  /* Signed-in account → admin record. Live, so a revoked role logs
     the person out of the UI without needing a refresh. */
  useEffect(() => {
    if (!isFirebaseConfigured || !user) return undefined;

    setStatus('loading');
    return onSnapshot(
      doc(db, ADMINS_COLLECTION, user.uid),
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.disabled) {
            setProfile(null);
            setStatus('forbidden');
            return;
          }
          setProfile({ id: snapshot.id, ...data });
          setBootstrapNeeded(false);
          setStatus('authorised');
          return;
        }

        // No admin record. Either this site has never been set up, or
        // this account simply is not an administrator.
        setProfile(null);
        const claimable = await isClaimable();
        setBootstrapNeeded(claimable);
        setStatus(claimable ? 'bootstrap' : 'forbidden');
      },
      async (error) => {
        // A permission error on our own admin doc means the rules are
        // in place but we are not listed — unless nothing exists yet.
        console.warn('[auth] admin lookup failed:', error?.message);
        const claimable = await isClaimable();
        setBootstrapNeeded(claimable);
        setStatus(claimable ? 'bootstrap' : 'forbidden');
      }
    );
  }, [user]);

  const signIn = useCallback(async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const resetPassword = useCallback(async (email) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  /** One-time first-run claim. Fails safely if anyone got there first. */
  const claimOwnership = useCallback(
    async (displayName) => {
      if (!user) throw new Error('Sign in first.');
      if (!(await isClaimable())) {
        throw new Error('This site already has an administrator.');
      }

      const batch = writeBatch(db);
      batch.set(doc(db, ADMINS_COLLECTION, user.uid), {
        email: user.email,
        name: displayName?.trim() || user.displayName || user.email,
        role: 'owner',
        disabled: false,
        createdAt: serverTimestamp(),
      });
      // Writing this marker is what closes the door behind us.
      batch.set(doc(db, SITE_COLLECTION, SECURITY_DOC), {
        bootstrapped: true,
        bootstrappedBy: user.uid,
        bootstrappedAt: serverTimestamp(),
      });
      await batch.commit();

      if (displayName?.trim() && !user.displayName) {
        await updateProfile(user, { displayName: displayName.trim() }).catch(() => {});
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      status,
      bootstrapNeeded,
      role: profile?.role || null,
      can: (capability) => (profile?.role ? can(profile.role, capability) : false),
      signIn,
      signOut,
      resetPassword,
      claimOwnership,
    }),
    [user, profile, status, bootstrapNeeded, signIn, signOut, resetPassword, claimOwnership]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** True while the site has never been claimed by an owner. */
async function isClaimable() {
  try {
    const marker = await getDoc(doc(db, SITE_COLLECTION, SECURITY_DOC));
    return !marker.exists();
  } catch {
    // If even reading the marker is denied, assume the site is set up.
    return false;
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
