import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import type { Plugin } from 'vite';
import { breach } from './tools/breach-plugin';

// Dev-only: dev-tools/main.jsx POSTs console errors / probes here so they can
// be read from outside the canvas (logs/harness-console.log).
const harnessLog = (): Plugin => ({
  name: 'harness-log',
  configureServer(server) {
    const file = path.resolve(__dirname, 'logs/harness-console.log');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    server.middlewares.use('/__harness-log', (req, res) => {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        fs.appendFileSync(file, `${new Date().toISOString()} ${body}\n`);
        res.statusCode = 204;
        res.end();
      });
    });
  },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(__dirname, 'dev-tools'),
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [breach(), harnessLog(), react(), tailwind()],
  resolve: {
    alias: {
      // Stub the Devvit client so src/client/splash.ts / game.ts run unmodified
      // outside the Devvit playtest environment.
      '@devvit/web/client': path.resolve(__dirname, 'dev-tools/devvit-shim.ts'),
      // Let stories import from the main src tree
      '@src': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5174,
    // Farnsworth boots this server for its in-app canvas iframe — don't pop a
    // separate browser tab on Go Live.
    open: false,
    proxy: {
      // Forward tRPC calls to the Devvit server (WEBBIT_PORT, default 3000).
      // Game.tsx uses trpc.init.get.query() so without this, dev-tools can't
      // load the real game. Splash.tsx is tRPC-free.
      '/api/trpc': {
        target: `http://localhost:${process.env.WEBBIT_PORT ?? 3000}`,
        changeOrigin: true,
      },
    },
  },
});