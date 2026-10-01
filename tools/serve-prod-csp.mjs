#!/usr/bin/env node
// Serve the production client build (dist/client) under Reddit's webview
// script CSP, to catch what the dev harness can't: CDN loads, eval, and
// bundler chunk-ordering bugs. Run `npx vite build` first.
//
//   node tools/serve-prod-csp.mjs [port=5199]
//   → http://localhost:5199/splash.html (post view)  /game.html (app view)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/client');
const PORT = Number(process.argv[2] || 5199);
// Copied from the CSP violation Reddit reports for webview scripts.
const CSP = "script-src 'self' webview.devvit.net webview-dev.devvit.net 'wasm-unsafe-eval'";
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/__csp-log') {
      let b = '';
      req.on('data', (c) => (b += c));
      req.on('end', () => (console.log('[page]', b), res.writeHead(204).end()));
      return;
    }
    const file = path.join(ROOT, decodeURIComponent(url.pathname === '/' ? '/splash.html' : url.pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      console.log('404', url.pathname);
      return res.writeHead(404).end();
    }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file)] || 'application/octet-stream',
      'content-security-policy': `${CSP}; report-uri /__csp-log`,
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`prod+CSP preview: http://localhost:${PORT}/splash.html`));
