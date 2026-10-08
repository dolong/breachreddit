import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Shell } from './Shell.jsx';

// Farnsworth canvas views boot the REAL client entries (same code that ships),
// one per document — the dc-runtime owns the whole page, so no React wrapper.
//   ?view=post             → src/client/splash.ts  (Postview, inline)
//   ?view=mobile|desktop   → src/client/game.ts    (Space Dice Run v15, expanded)
//   ?view=game             → same as desktop; target of the shim's requestExpandedMode
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
// type: default -> splash (Postview), game -> Space Dice Run.
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
} else {
  createRoot(root).render(
    <StrictMode>
      <Shell />
    </StrictMode>,
  );
}
