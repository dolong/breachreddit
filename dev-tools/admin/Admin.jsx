import { useCallback, useEffect, useState } from 'react';
import { CardsView } from './CardsView.jsx';
import { loadCards } from './cards.js';
import './admin.css';

// Breach admin / debug "storybook". Dev-only: routed from dev-tools/main.jsx at
// ?view=admin, which only the Farnsworth dev server serves — nothing here is
// in the production client build (vite.config.ts never touches dev-tools/).
//
// Add a view: write a component taking ({ params, setParams }) and register it
// here. URL: ?view=admin&page=<id>[&...view params], so every state is linkable
// (and reachable from Farnsworth tests).
const PAGES = [
  { id: 'cards', label: 'CARDS', View: CardsView, count: () => loadCards().cards.length },
];

const readParams = () => new URLSearchParams(window.location.search);

export const Admin = () => {
  const [params, setParamsState] = useState(readParams);

  useEffect(() => {
    const onPop = () => setParamsState(readParams());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /** Merge into the URL (null deletes) without reloading. */
  const setParams = useCallback((patch, { push = false } = {}) => {
    const next = readParams();
    for (const [k, v] of Object.entries(patch)) {
      if (v == null) next.delete(k);
      else next.set(k, v);
    }
    const url = `${window.location.pathname}?${next}`;
    if (push) window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
    setParamsState(next);
  }, []);

  const page = PAGES.find((p) => p.id === params.get('page')) || PAGES[0];
  const { View } = page;

  return (
    <div className="adm" data-testid="admin-root">
      <nav className="adm-side">
        <div className="adm-logo">
          BREACH
          <small>ADMIN · DEBUG VIEWS</small>
        </div>
        <div className="adm-navlabel">VIEWS</div>
        {PAGES.map((p) => (
          <button
            key={p.id}
            type="button"
            data-testid={`admin-nav-${p.id}`}
            className={'adm-nav' + (p === page ? ' on' : '')}
            onClick={() => setParams({ page: p.id, card: null }, { push: true })}
          >
            {p.label}
            <span className="n">{p.count?.()}</span>
          </button>
        ))}
        <div className="adm-sidefoot">
          <a className="adm-back" href="/?view=desktop">
            ← BACK TO GAME
          </a>
          <div className="adm-badge">FARNSWORTH DEV ONLY · NOT SHIPPED</div>
        </div>
      </nav>
      <main className="adm-main">
        <View params={params} setParams={setParams} />
      </main>
    </div>
  );
};
