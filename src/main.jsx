import { StrictMode, Suspense, lazy, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import { injectStructuredData } from './seo/structuredData';
import { applySeo } from './seo/meta';
import { hydrateContent, watchSiteDocuments } from './content/hydrate';
import { useContentVersion } from './content/store';
import './index.css';

// The admin panel is a separate chunk — visitors to the marketing site
// never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'));

/**
 * The public site, re-mounted whenever CMS content changes.
 *
 * Content lives in module-level live bindings rather than context, so a
 * key change is what pushes new copy through the tree. It only happens
 * on an admin edit, never during normal browsing.
 */
function PublicSite() {
  const version = useContentVersion();

  useEffect(() => {
    // Structured data and <head> metadata are rebuilt from the current
    // content so they can never drift from what is on the page.
    applySeo();
    injectStructuredData();
  }, [version]);

  useEffect(() => watchSiteDocuments(), []);

  return <App key={version} />;
}

function AdminFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0B1120',
        color: '#94A3B8',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
      }}
    >
      Loading admin…
    </div>
  );
}

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Content is fetched BEFORE the first render so visitors never see the
 * bundled placeholder copy flash to the owner's copy. A slow network
 * must not hold the page hostage though, so the wait is capped — the
 * live watcher applies late-arriving content a moment later.
 */
const CONTENT_TIMEOUT = 2500;

const raceWithTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((resolve) => window.setTimeout(resolve, ms))]);

function render() {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Root />
    </StrictMode>
  );
}

// The admin panel loads its own data, so it should not wait on the
// public content fetch.
if (window.location.pathname.startsWith('/admin')) {
  render();
} else {
  raceWithTimeout(hydrateContent(), CONTENT_TIMEOUT).then(render, render);
}
