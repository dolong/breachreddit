import { useEffect, useMemo, useRef, useState } from 'react';
import { DECKS, loadCards, riskDots } from './cards.js';

const FRAME_W = 82;
const FRAME_H = 135;
const FRAMES = 24;
const TILE_SCALE = 1.4; // card art size at 100% zoom
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;
const ZOOM_KEY = 'breach-admin-zoom';
const clampZoom = (z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z / ZOOM_STEP) * ZOOM_STEP));
const savedZoom = () => {
  const z = parseFloat(localStorage.getItem(ZOOM_KEY));
  return Number.isFinite(z) ? clampZoom(z) : 1;
};
const UNLOCK_KINDS = [
  ['base', 'BASE'],
  ['clears', 'CLEARS'],
  ['feat', 'FEAT'],
  ['ship', 'SHIP'],
  ['shop', 'SHOP'],
];
const SORTS = [
  ['game', 'GAME ORDER'],
  ['name', 'NAME'],
  ['risk', 'RISK'],
  ['unlock', 'UNLOCK'],
];
const UNLOCK_COL = { base: '#6af5d6', clears: '#c98bff', feat: '#ff9a4d', ship: '#7ab8ff', pool: '#7ab8ff', shop: '#ffd644' };

const toggle = (set, v) => {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
};

const copy = (text) => navigator.clipboard?.writeText(text).catch(() => {});

export const CardArt = ({ card, scale, animate }) => (
  <div
    className={'adm-art' + (animate ? ' anim' : '')}
    style={{
      width: FRAME_W * scale,
      height: FRAME_H * scale,
      backgroundImage: `url(/assets/anim/${card.art}.png)`,
      backgroundSize: `${FRAME_W * FRAMES * scale}px ${FRAME_H * scale}px`,
      '--sw': `${FRAME_W * FRAMES * scale}px`,
      filter: card.hue ? `hue-rotate(${card.hue}deg)` : 'none',
    }}
  />
);

const Tile = ({ card, n, scale, animate, selected, onPick }) => (
  <button
    type="button"
    data-testid={`admin-card-${card.deck}-${card.id}`}
    className={'adm-card' + (selected ? ' sel' : '')}
    style={{ '--c': card.color, '--dc': DECKS[card.deck].col, '--uc': UNLOCK_COL[card.unlock.kind] }}
    onClick={() => onPick(card.key)}
  >
    <div className="hdr">
      <span className="num">#{String(n).padStart(2, '0')}</span>
      <span className="deck">{DECKS[card.deck].short}</span>
    </div>
    <CardArt card={card} scale={scale} animate={animate} />
    <div className="name">{card.name}</div>
    <div className="meta">
      RISK {riskDots(card.risk)}
      {card.dice != null ? ` · ${card.dice} ${card.dice === 1 ? 'DIE' : 'DICE'}` : ''}
    </div>
    {card.face && <div className="face">{card.face}</div>}
    <div className="unlock">{card.unlock.label}</div>
    {(
      <div className="rules">
        {card.rules.map((r, i) => (
          <div key={i}>
            <b>◆</b>
            <span>{r}</span>
          </div>
        ))}
      </div>
    )}
    {(card.tags.length > 0 || card.note) && (
      <div className="tags">
        {card.note && <span className="adm-tag warn">{card.note.toUpperCase()}</span>}
        {card.tags.map((t) => (
          <span key={t} className="adm-tag">
            {t}
          </span>
        ))}
      </div>
    )}
  </button>
);

const Detail = ({ card, onClose }) => {
  const src = `${card.file}:${card.line}`;
  const json = JSON.stringify(card.raw, null, 2);
  return (
    <aside className="adm-detail" data-testid="admin-card-detail" style={{ '--c': card.color }}>
      <div className="hd">
        <div>
          <div style={{ fontSize: 9, color: DECKS[card.deck].col, marginBottom: 6 }}>{DECKS[card.deck].label} · {card.id}</div>
          <h3>{card.name}</h3>
        </div>
        <button type="button" className="adm-x" onClick={onClose} title="Close (Esc)">
          ✕
        </button>
      </div>
      <div className="artwrap">
        <CardArt card={card} scale={2.4} animate />
      </div>
      <dl className="adm-kv">
        <dt>RISK</dt>
        <dd>{riskDots(card.risk)}</dd>
        <dt>DICE</dt>
        <dd>{card.dice ?? '—'}</dd>
        {card.face && (
          <>
            <dt>FACE</dt>
            <dd style={{ color: '#ffd644' }}>{card.face}</dd>
          </>
        )}
        <dt>UNLOCK</dt>
        <dd style={{ color: UNLOCK_COL[card.unlock.kind] }}>{card.unlock.label}</dd>
        <dt>IN DECK</dt>
        <dd>{card.inDeck ? 'YES' : 'NO'}{card.note ? ` · ${card.note}` : ''}</dd>
        <dt>ART</dt>
        <dd>
          {card.art}
          {card.hue ? ` · hue ${card.hue}°` : ''}
        </dd>
        {card.tags.length > 0 && (
          <>
            <dt>FLAGS</dt>
            <dd>{card.tags.join(' · ')}</dd>
          </>
        )}
      </dl>
      <div className="adm-h4">RULES</div>
      <div className="rules">
        {card.rules.map((r, i) => (
          <div key={i}>
            <b>◆</b>
            <span>{r}</span>
          </div>
        ))}
      </div>
      <div className="adm-h4">
        SOURCE
        <button type="button" className="adm-copy" onClick={() => copy(src)}>
          COPY
        </button>
      </div>
      <div className="adm-pre">{src}</div>
      <div className="adm-h4">
        RAW DATA
        <button type="button" className="adm-copy" onClick={() => copy(json)}>
          COPY
        </button>
      </div>
      <pre className="adm-pre">{json}</pre>
    </aside>
  );
};

export const CardsView = ({ params, setParams }) => {
  const { cards, errors } = useMemo(loadCards, []);
  const [q, setQ] = useState('');
  const [decks, setDecks] = useState(new Set());
  const [unlocks, setUnlocks] = useState(new Set());
  const [risks, setRisks] = useState(new Set());
  const [sort, setSort] = useState('game');
  const [zoom, setZoomState] = useState(savedZoom);
  const scale = TILE_SCALE;
  const scroller = useRef(null);
  const setZoom = (z) => setZoomState((cur) => clampZoom(typeof z === 'function' ? z(cur) : z));
  useEffect(() => localStorage.setItem(ZOOM_KEY, String(zoom)), [zoom]);
  const [animate, setAnimate] = useState(false);
  const search = useRef(null);
  const selected = params.get('card');

  const pick = (key) => setParams({ card: key === selected ? null : key });

  useEffect(() => {
    const onKey = (e) => {
      const typing = document.activeElement === search.current;
      if (!typing && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        setZoom((z) => z + ZOOM_STEP);
      } else if (!typing && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setZoom((z) => z - ZOOM_STEP);
      } else if (!typing && e.key === '0') {
        setZoom(1);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        search.current?.focus();
      } else if (e.key === 'Escape') {
        if (document.activeElement === search.current && q) setQ('');
        else setParams({ card: null });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, setParams]);

  // Ctrl/Cmd + wheel (and trackpad pinch) over the grid zooms the cards.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoomState((z) => clampZoom(z * Math.exp(-e.deltaY * 0.01)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = cards.filter((c) => {
      if (decks.size && !decks.has(c.deck)) return false;
      if (unlocks.size && !unlocks.has(c.unlock.kind === 'pool' ? 'ship' : c.unlock.kind)) return false;
      if (risks.size && !risks.has(c.risk)) return false;
      if (!needle) return true;
      return [c.id, c.name, c.art, c.unlock.label, c.face || '', ...c.rules, ...c.tags, ...c.by].join(' ').toLowerCase().includes(needle);
    });
    const by = {
      game: (a, b) => a.order - b.order,
      name: (a, b) => a.name.localeCompare(b.name),
      risk: (a, b) => (a.risk ?? 9) - (b.risk ?? 9) || a.order - b.order,
      unlock: (a, b) => a.unlock.sort - b.unlock.sort || a.order - b.order,
    }[sort];
    return Object.keys(DECKS).map((deck) => ({ deck, list: list.filter((c) => c.deck === deck).sort(by) })).filter((g) => g.list.length);
  }, [cards, q, decks, unlocks, risks, sort]);

  const total = shown.reduce((n, g) => n + g.list.length, 0);
  const detail = cards.find((c) => c.key === selected);
  const tile = Math.max(150, FRAME_W * scale + 40);

  return (
    <>
      <header className="adm-top">
        <div className="adm-title">CARDS</div>
        <input
          ref={search}
          className="adm-search"
          data-testid="admin-cards-search"
          placeholder="Search name, rule, flag…  ( / )"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="adm-group">
          <span>DECK</span>
          {Object.entries(DECKS).map(([k, d]) => (
            <button key={k} type="button" className={'adm-chip' + (decks.has(k) ? ' on' : '')} style={{ '--c': d.col }} onClick={() => setDecks(toggle(decks, k))}>
              {d.label} {cards.filter((c) => c.deck === k).length}
            </button>
          ))}
        </div>
        <div className="adm-group">
          <span>UNLOCK</span>
          {UNLOCK_KINDS.map(([k, label]) => (
            <button key={k} type="button" className={'adm-chip' + (unlocks.has(k) ? ' on' : '')} style={{ '--c': UNLOCK_COL[k] }} onClick={() => setUnlocks(toggle(unlocks, k))}>
              {label}
            </button>
          ))}
        </div>
        <div className="adm-group">
          <span>RISK</span>
          {[0, 1, 2, 3].map((r) => (
            <button key={r} type="button" className={'adm-chip' + (risks.has(r) ? ' on' : '')} onClick={() => setRisks(toggle(risks, r))}>
              {riskDots(r)}
            </button>
          ))}
        </div>
        <div className="adm-group">
          <span>SORT</span>
          {SORTS.map(([k, label]) => (
            <button key={k} type="button" className={'adm-chip' + (sort === k ? ' on' : '')} onClick={() => setSort(k)}>
              {label}
            </button>
          ))}
        </div>
        <div className="adm-group">
          <span>ZOOM</span>
          <button type="button" className="adm-chip adm-zbtn" data-testid="admin-zoom-out" onClick={() => setZoom((z) => z - ZOOM_STEP)} disabled={zoom <= ZOOM_MIN} title="Zoom out ( - )">
            −
          </button>
          <input
            type="range"
            className="adm-zoom"
            data-testid="admin-zoom"
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={ZOOM_STEP}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            title="Zoom ( + / - / 0, or Ctrl/Cmd + scroll )"
          />
          <button type="button" className="adm-chip adm-zbtn" data-testid="admin-zoom-in" onClick={() => setZoom((z) => z + ZOOM_STEP)} disabled={zoom >= ZOOM_MAX} title="Zoom in ( + )">
            +
          </button>
          <button type="button" className="adm-chip adm-zpct" data-testid="admin-zoom-reset" onClick={() => setZoom(1)} title="Reset to 100% ( 0 )">
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" className={'adm-chip' + (animate ? ' on' : '')} onClick={() => setAnimate(!animate)} title="Animate every card (hover animates one)">
            ANIMATE
          </button>
        </div>
        <div className="adm-count" data-testid="admin-cards-count">
          {total} / {cards.length} CARDS
        </div>
      </header>
      {errors.length > 0 && <div className="adm-errors">Could not read: {errors.join('\n')}</div>}
      <div className="adm-body">
        <div className="adm-scroll" ref={scroller}>
          {shown.map(({ deck, list }) => (
            <section key={deck}>
              <div className="adm-section" style={{ '--c': DECKS[deck].col }}>
                <h2>{DECKS[deck].label}</h2>
                <p>
                  {list.length} · {DECKS[deck].where.toUpperCase()}
                </p>
              </div>
              <div className="adm-grid" data-testid={`admin-grid-${deck}`} style={{ '--tile': `${tile}px`, zoom }}>
                {list.map((c) => (
                  <Tile key={c.key} card={c} n={c.order + 1} scale={scale} animate={animate} selected={c.key === selected} onPick={pick} />
                ))}
              </div>
            </section>
          ))}
          {!total && <div className="adm-empty">No cards match. Press <span className="adm-kbd">Esc</span> to clear the search.</div>}
        </div>
        {detail && <Detail card={detail} onClose={() => setParams({ card: null })} />}
      </div>
    </>
  );
};
