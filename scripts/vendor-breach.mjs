#!/usr/bin/env node
// One-time vendoring for the Breach concept: pulls every external resource the
// .dc.html files reach for (SFX pack on R2, Google Fonts) into vendor/breach/
// so the shipped game is fully same-origin (Reddit's webview CSP blocks
// third-party scripts, fonts, and media). Re-run only if the upstream SFX pack
// or font list changes; the output is committed.
//
//   node scripts/vendor-breach.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'vendor/breach');
const SFX_BASE = 'https://pub-3d18c0cc748f418297166885dea0c707.r2.dev/sfx/';
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Jersey+15&family=Silkscreen&family=Pixelify+Sans:wght@400;500;600&display=swap';
const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function get(url, asText = false) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': CHROME_UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return asText ? await res.text() : Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (attempt === 3) throw new Error(`${url}: ${e.message}`);
    }
  }
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) await fn(items[i++]);
    })
  );
}

async function vendorSfx() {
  const dir = path.join(OUT, 'sfx');
  const manifestText = await get(SFX_BASE + 'manifest.json', true);
  const manifest = JSON.parse(manifestText);
  const files = new Set();
  for (const ev of Object.values(manifest.events)) {
    for (const f of [...(ev.ogg ?? []), ...(ev.mp3 ?? [])]) files.add(f);
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'manifest.json'), manifestText);
  let done = 0;
  await pool([...files], 8, async (f) => {
    const dest = path.join(dir, f);
    if (fs.existsSync(dest)) return void done++;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, await get(SFX_BASE + f));
    done++;
  });
  console.log(`sfx: ${done}/${files.size} files`);
}

async function vendorFonts() {
  const dir = path.join(OUT, 'fonts');
  fs.mkdirSync(dir, { recursive: true });
  let css = await get(FONTS_URL, true);
  const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) ?? [])];
  await pool(urls, 6, async (u) => {
    const name = u.split('/').slice(-2).join('_');
    fs.writeFileSync(path.join(dir, name), await get(u));
    css = css.split(u).join(name);
  });
  fs.writeFileSync(path.join(dir, 'breach-fonts.css'), css);
  console.log(`fonts: ${urls.length} woff2 files`);
}

await vendorSfx();
await vendorFonts();
