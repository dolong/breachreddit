// Every card in Breach, normalized into one shape for the admin Cards view.
// Sources (read live, see dcData.js):
//   Adventure    breach-concept/Main.dc.html       CARDS, FEATS
//   Boss tactic  breach-concept/Boss-Fight.dc.html CARDS, ART, SHIP_CARD, ROLES
//   Trading Post breach-concept/Main.dc.html       TP.cards, TP_ART
import mainRaw from '../../breach-concept/Main.dc.html?raw';
import bossRaw from '../../breach-concept/Boss-Fight.dc.html?raw';
import { dcField, lineOf } from './dcData.js';

export const DECKS = {
  adventure: { label: 'ADVENTURE', short: 'ADV', col: '#48f320', where: 'Dealt at each station' },
  tactic: { label: 'BOSS TACTIC', short: 'TAC', col: '#ff5cd6', where: 'Offered each round of a boss fight' },
  shop: { label: 'TRADING POST', short: 'TP', col: '#ffd644', where: 'Bought with prestige at the Trading Post' },
};

const MAIN_FILE = 'breach-concept/Main.dc.html';
const BOSS_FILE = 'breach-concept/Boss-Fight.dc.html';
const ADV_BASE_KEYS = new Set(['id', 'name', 'risk', 'color', 'art', 'hue', 'n', 'unlock', 'rules']);

const riskCount = (r) => (typeof r === 'number' ? r : (String(r).match(/●/g) || []).length);
const dots = (n) => '●'.repeat(n) + '○'.repeat(Math.max(0, 3 - n));
const flagTag = (k, v) => (v === true || v === 1 ? k : `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`);

const adventure = () => {
  const cards = dcField(mainRaw, 'CARDS');
  const feats = dcField(mainRaw, 'FEATS').value;
  return cards.value.map((c, i) => {
    const u = c.unlock;
    const unlock = !u
      ? { kind: 'base', label: 'BASE DECK', sort: 0 }
      : u.clears
        ? { kind: 'clears', label: `${u.clears} SECTOR CLEAR${u.clears > 1 ? 'S' : ''}`, sort: 100 + u.clears }
        : { kind: 'feat', label: `FEAT · ${feats[u.feat] || u.feat}`, sort: 200 + i };
    const tags = Object.keys(c).filter((k) => !ADV_BASE_KEYS.has(k)).map((k) => flagTag(k, c[k]));
    return {
      key: `adventure:${c.id}`, deck: 'adventure', order: i, id: c.id, name: c.name, color: c.color,
      art: c.art, hue: c.hue || 0, risk: riskCount(c.risk), dice: c.n ?? null, rules: c.rules, face: null,
      unlock, tags, inDeck: true, note: c.hazardOnly ? 'Hazard nodes only' : null, by: [],
      file: MAIN_FILE, line: lineOf(mainRaw, `id: '${c.id}'`, cards.start, cards.end), raw: c,
    };
  });
};

const tactic = () => {
  const cards = dcField(bossRaw, 'CARDS');
  const art = dcField(bossRaw, 'ART').value;
  const shipCard = dcField(bossRaw, 'SHIP_CARD').value;
  const roles = dcField(bossRaw, 'ROLES').value;
  return Object.entries(cards.value).map(([id, c], i) => {
    const by = Object.entries(shipCard).filter(([, cid]) => cid === id).map(([ship]) => roles[ship]?.name || ship.toUpperCase());
    return {
      key: `tactic:${id}`, deck: 'tactic', order: i, id, name: c.name, color: c.col,
      art: art[id] || 'adv_back', hue: 0, risk: riskCount(c.risk), dice: c.n ?? null, rules: c.rule, face: c.face || null,
      unlock: by.length ? { kind: 'ship', label: `BROUGHT BY ${by.join(' · ')}`, sort: 300 } : { kind: 'pool', label: 'TACTIC POOL', sort: 310 },
      tags: [], inDeck: true, note: null, by,
      file: BOSS_FILE, line: lineOf(bossRaw, `${id}: {`, cards.start, cards.end), raw: { id, art: art[id], ...c },
    };
  });
};

const shop = () => {
  const tp = dcField(mainRaw, 'TP');
  const tpArt = dcField(mainRaw, 'TP_ART').value;
  return tp.value.cards.map(([id, name, price, desc, soon], i) => ({
    key: `shop:${id}`, deck: 'shop', order: i, id, name, color: DECKS.shop.col,
    art: String(tpArt[id] || 'adv_back').replace(/_f0$/, ''), hue: 0, risk: null, dice: null, rules: desc ? [desc.toUpperCase()] : [], face: null,
    unlock: { kind: 'shop', label: `${price} PRESTIGE`, sort: 400 + price }, tags: soon ? ['coming-next-pass'] : [],
    inDeck: false, note: soon ? 'Shelf shows COMING NEXT PASS · not in any deck yet' : 'Unlock only', by: [],
    file: MAIN_FILE, line: lineOf(mainRaw, `'${id}'`, tp.start, tp.end), raw: { id, name, price, desc, soon: !!soon, art: tpArt[id] },
  }));
};

/** Load all decks. Each deck fails independently so one bad edit doesn't blank the page. */
export const loadCards = () => {
  const out = [];
  const errors = [];
  for (const [deck, fn] of [['adventure', adventure], ['tactic', tactic], ['shop', shop]]) {
    try {
      out.push(...fn());
    } catch (e) {
      errors.push(`${DECKS[deck].label}: ${e.message}`);
    }
  }
  return { cards: out, errors };
};

export const riskDots = (n) => (n == null ? '—' : dots(n));
