// Reads class-field literals (CARDS, PARTS, TP, …) straight out of a concept
// .dc.html, imported with Vite's ?raw. Admin views therefore always show what
// the game actually ships (and hot-reload when the concept file changes) —
// nothing here is a hand-copied snapshot.
//
// Dev-only: evaluates the literal with Function(). That never reaches the
// production client (dev-tools/ is served only by the Farnsworth dev server).

const scriptStart = (raw) => {
  const i = raw.indexOf('<script type="text/x-dc"');
  if (i < 0) throw new Error('[admin] no dc logic script in source');
  return i;
};

const lineAt = (raw, index) => raw.slice(0, index).split('\n').length;

/** Index just past the bracket that closes the one at `start` (strings + comments aware). */
const matchBracket = (src, start) => {
  let depth = 0;
  let q = null;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (q) {
      if (ch === '\\') i++;
      else if (ch === q) q = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') q = ch;
    else if (ch === '/' && src[i + 1] === '/') i = src.indexOf('\n', i);
    else if (ch === '/' && src[i + 1] === '*') i = src.indexOf('*/', i) + 1;
    else if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') {
      depth--;
      if (!depth) return i + 1;
    }
  }
  throw new Error('[admin] unbalanced literal');
};

// Stand-in for the component's static asset resolver used inside some literals.
const ComponentStub = { __A: (p) => '/' + String(p).replace(/^\.?\//, '') };

/**
 * `FIELD = [...]` / `FIELD = {...}` on the component class → { value, line, start, end }.
 * `start`/`end` are offsets into `raw` so callers can locate entries (see lineOf).
 */
export const dcField = (raw, field) => {
  const s0 = scriptStart(raw);
  const re = new RegExp('^[ \\t]+' + field + '\\s*=\\s*(?=[\\[{])', 'm');
  const m = re.exec(raw.slice(s0));
  if (!m) throw new Error(`[admin] ${field} not found`);
  const start = s0 + m.index + m[0].length;
  const end = matchBracket(raw, start);
  const value = new Function('Component', `return (${raw.slice(start, end)});`)(ComponentStub);
  return { value, line: lineAt(raw, start), start, end };
};

/** Line of the first `needle` inside [from, to) of raw, or the line of `from`. */
export const lineOf = (raw, needle, from = 0, to = raw.length) => {
  const i = raw.indexOf(needle, from);
  return lineAt(raw, i >= 0 && i < to ? i : from);
};
