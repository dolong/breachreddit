import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Shell } from './Shell.jsx';

// Farnsworth canvas views boot the REAL client entries (same code that ships),
// one per document — the dc-runtime owns the whole page, so no React wrapper.
//   ?view=post             → src/client/splash.ts  (Postview, inline)
//   ?view=mobile|desktop   → src/client/game.ts    (Main, expanded)
//   ?view=game             → same as desktop; target of the shim's requestExpandedMode
//   ?view=admin&page=cards → dev-tools/admin (debug/admin storybook) — dev server only
// Forward errors to the dev server (logs/harness-console.log) — the canvas
// console isn't otherwise visible to tooling.
const report = (kind, args) => {
  try {
    const msg = args.map((a) => (a instanceof Error ? a.stack || a.message : typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    navigator.sendBeacon('/__harness-log', `[${kind}] ${location.search} ${msg}`);
  } catch {}
};
window.__harnessLog = (...a) => report('probe', a);
for (const k of ['error', 'warn']) {
  const orig = console[k].bind(console);
  console[k] = (...a) => { report(k, a); orig(...a); };
}
window.addEventListener('error', (e) => report('uncaught', [e.error || e.message]));
window.addEventListener('unhandledrejection', (e) => report('rejection', [e.reason]));
report('boot', [navigator.userAgent.slice(0, 60), innerWidth + 'x' + innerHeight]);

const view = new URLSearchParams(window.location.search).get('view');
const root = document.getElementById('root');

// Post View routes by devvit.json entrypoint so Farnsworth can show any post
// type: default -> splash (Postview), game -> Main.
const ENTRIES = {
  default: () => import('@src/client/splash'),
  game: () => import('@src/client/game'),
};

if (view === 'post') {
  root.remove();
  const entry = new URLSearchParams(window.location.search).get('entry') || 'default';
  (ENTRIES[entry] || ENTRIES.default)();
} else if (view === 'mobile' || view === 'desktop' || view === 'game') {
  root.remove();
  import('@src/client/game');
  if (view === 'desktop' && import.meta.env.DEV) addAdminEntry();
} else if (view === 'admin') {
  // Admin/debug views exist only on the Farnsworth dev server (never in the
  // Devvit client build). The DEV guard also keeps them out of build:tools.
  if (!import.meta.env.DEV) {
    root.textContent = 'Admin views are only available in Farnsworth development.';
  } else {
    document.title = 'Breach · Admin';
    const fonts = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: '/fonts/breach-fonts.css' });
    document.head.appendChild(fonts);
    import('./admin/Admin.jsx').then(({ Admin }) => createRoot(root).render(<StrictMode><Admin /></StrictMode>));
  }
} else {
  createRoot(root).render(
    <StrictMode>
      <Shell />
    </StrictMode>,
  );
}

// Small corner link from the desktop/fullscreen game into the admin views.
// Harness-only (this file never ships), desktop-only so mobile layouts and
// mobile tests are untouched.
function addAdminEntry() {
  const a = document.createElement('a');
  a.href = '/?view=admin&page=cards';
  a.textContent = 'ADMIN';
  a.title = 'Breach admin / debug views (Farnsworth dev only)';
  a.dataset.testid = 'admin-entry';
  Object.assign(a.style, {
    position: 'fixed', left: '8px', bottom: '8px', zIndex: '2147483647', padding: '4px 8px',
    font: '10px/1 ui-monospace, Menlo, monospace', letterSpacing: '1px', color: '#ffd644',
    background: 'rgba(7,6,15,.85)', border: '1px solid #3a3a5a', borderRadius: '6px',
    textDecoration: 'none', opacity: '0.45', transition: 'opacity .15s',
  });
  a.onmouseenter = () => (a.style.opacity = '1');
  a.onmouseleave = () => (a.style.opacity = '0.45');
  document.body.appendChild(a);
}
