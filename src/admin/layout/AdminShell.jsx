/**
 * The persistent frame around every admin page: sidebar, top bar,
 * dark-mode switch and the command palette (⌘K / Ctrl-K).
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Sun,
  Moon,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { navigation, allNavItems } from './navigation';
import { useAuth } from '../auth/AuthProvider';
import { useCollection } from '../data/hooks';
import { LEADS_COLLECTION, roleMeta } from '../../lib/collections';
import { businessConfig } from '../../config/business';
import { Badge, IconButton, Button } from '../ui/primitives';
import { Modal } from '../ui/overlays';

const THEME_KEY = 'ccm_admin_theme';

/** Dark mode is a per-device preference, kept out of Firestore. */
function useAdminTheme() {
  const [dark, setDark] = useState(() => {
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      if (stored) return stored === 'dark';
    } catch {
      /* storage unavailable */
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      window.localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
    // The public site is light-only; make sure we do not leave the
    // class behind when the admin unmounts.
    return () => document.documentElement.classList.remove('dark');
  }, [dark]);

  return [dark, setDark];
}

export function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [dark, setDark] = useAdminTheme();
  const { profile, signOut, can } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Unworked leads drive the sidebar badge — the one number an owner
  // wants visible from every screen.
  const { items: newLeads } = useCollection(LEADS_COLLECTION, {
    filter: ['status', '==', 'new'],
    max: 100,
  });
  const badges = useMemo(() => ({ newLeads: newLeads.length }), [newLeads.length]);

  useEffect(() => setSidebarOpen(false), [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const visibleGroups = useMemo(
    () =>
      navigation
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => !item.capability || can(item.capability)),
        }))
        .filter((group) => group.items.length > 0),
    [can]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200',
          'dark:border-slate-800 dark:bg-slate-900',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-200 px-4 dark:border-slate-800">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">
              {businessConfig.shortName || businessConfig.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Admin panel</p>
          </div>
          <IconButton
            icon={X}
            label="Close menu"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        </div>

        <nav className="admin-scroll flex-1 overflow-y-auto px-3 py-4">
          {visibleGroups.map((group) => (
            <div key={group.title || 'root'} className="mb-5 last:mb-0">
              {group.title && (
                <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge && badges[item.badge] > 0 && (
                        <span className="shrink-0 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {badges[item.badge]}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200 text-[11px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {(profile?.name || profile?.email || '?').slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-slate-800 dark:text-slate-200">
                {profile?.name || profile?.email}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {roleMeta(profile?.role).label}
              </p>
            </div>
            <IconButton icon={LogOut} label="Sign out" size="sm" onClick={signOut} />
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* ── Main column ─────────────────────────────────── */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-slate-200 bg-white/85 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
          <IconButton
            icon={Menu}
            label="Open menu"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          />

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-[13px] text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 sm:max-w-xs"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 truncate">Jump to…</span>
            <kbd className="hidden shrink-0 rounded border border-slate-300 px-1.5 py-0.5 font-sans text-[10px] font-medium text-slate-400 dark:border-slate-700 sm:block">
              {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'} K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              as="a"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant="ghost"
              iconRight={ExternalLink}
              className="hidden sm:inline-flex"
            >
              View site
            </Button>
            <IconButton
              icon={dark ? Sun : Moon}
              label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setDark(!dark)}
            />
          </div>
        </header>

        <main className="admin-scroll px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelect={(to) => {
          setPaletteOpen(false);
          navigate(to);
        }}
        can={can}
      />
    </div>
  );
}

/* ── Command palette ───────────────────────────────────────── */

function CommandPalette({ open, onClose, onSelect, can }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
    }
  }, [open]);

  const results = useMemo(() => {
    const available = allNavItems.filter((item) => !item.capability || can(item.capability));
    const term = query.trim().toLowerCase();
    if (!term) return available;
    return available.filter(
      (item) =>
        item.label.toLowerCase().includes(term) || item.group.toLowerCase().includes(term)
    );
  }, [query, can]);

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCursor((index) => Math.min(index + 1, results.length - 1));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCursor((index) => Math.max(index - 1, 0));
      }
      if (event.key === 'Enter' && results[cursor]) {
        event.preventDefault();
        onSelect(results[cursor].to);
      }
    },
    [results, cursor, onSelect]
  );

  return (
    <Modal open={open} onClose={onClose} size="md" title="Jump to">
      <input
        autoFocus
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setCursor(0);
        }}
        onKeyDown={onKeyDown}
        placeholder="Search sections…"
        className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
      />

      {results.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-slate-500">No section matches that.</p>
      ) : (
        <ul className="max-h-80 space-y-0.5 overflow-y-auto">
          {results.map((item, index) => (
            <li key={item.to}>
              <button
                type="button"
                onMouseEnter={() => setCursor(index)}
                onClick={() => onSelect(item.to)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
                  index === cursor
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-300'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1 truncate">{item.label}</span>
                <Badge tone="slate">{item.group}</Badge>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export default AdminShell;
