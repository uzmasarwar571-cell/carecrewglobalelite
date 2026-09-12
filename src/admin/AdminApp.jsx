/**
 * ─────────────────────────────────────────────────────────────
 *  ADMIN PANEL — entry point
 * ─────────────────────────────────────────────────────────────
 *  Lazily loaded from main.jsx, so nothing in this tree ships to
 *  visitors of the marketing site.
 *
 *  Authentication gates the whole panel before any page mounts:
 *  a page never has to wonder whether there is a signed-in admin.
 * ─────────────────────────────────────────────────────────────
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import {
  LoginPage,
  ClaimOwnershipPage,
  ForbiddenPage,
  SetupPage,
  AuthLoading,
} from './auth/LoginPage';
import { ToastProvider } from './ui/overlays';
import { AdminShell } from './layout/AdminShell';

import { OverviewPage } from './pages/OverviewPage';
import { LeadsPage } from './pages/LeadsPage';
import { CopyPage } from './pages/CopyPage';
import { BlocksPage } from './pages/BlocksPage';
import { CollectionPage } from './pages/CollectionPage';
import { ThemePage } from './pages/ThemePage';
import { MediaPage } from './pages/MediaPage';
import { SettingsPage } from './pages/SettingsPage';
import { LegalPage } from './pages/LegalPage';
import { TeamPage } from './pages/TeamPage';
import { ActivityPage } from './pages/ActivityPage';
import { NotFoundPage, NoAccessPage } from './pages/StatusPages';

import './admin.css';

/** Renders `children` only for admins holding `capability`. */
function Guard({ capability, children }) {
  const { can } = useAuth();
  if (capability && !can(capability)) return <NoAccessPage />;
  return children;
}

function AdminRoutes() {
  const { status } = useAuth();

  if (status === 'unconfigured') return <SetupPage />;
  if (status === 'loading') return <AuthLoading />;
  if (status === 'signed-out') return <LoginPage />;
  if (status === 'bootstrap') return <ClaimOwnershipPage />;
  if (status === 'forbidden') return <ForbiddenPage />;

  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<OverviewPage />} />
        <Route path="leads" element={<LeadsPage />} />

        <Route
          path="copy"
          element={
            <Guard capability="content">
              <CopyPage />
            </Guard>
          }
        />
        <Route
          path="blocks"
          element={
            <Guard capability="content">
              <BlocksPage />
            </Guard>
          }
        />
        <Route
          path="collections/:collectionKey"
          element={
            <Guard capability="content">
              <CollectionPage />
            </Guard>
          }
        />
        <Route
          path="legal"
          element={
            <Guard capability="content">
              <LegalPage />
            </Guard>
          }
        />
        <Route
          path="theme"
          element={
            <Guard capability="theme">
              <ThemePage />
            </Guard>
          }
        />
        <Route
          path="media"
          element={
            <Guard capability="media">
              <MediaPage />
            </Guard>
          }
        />
        <Route
          path="settings"
          element={
            <Guard capability="settings">
              <SettingsPage />
            </Guard>
          }
        />
        <Route
          path="team"
          element={
            <Guard capability="admins">
              <TeamPage />
            </Guard>
          }
        />
        <Route
          path="activity"
          element={
            <Guard capability="settings">
              <ActivityPage />
            </Guard>
          }
        />

        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/admin/404" replace />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
