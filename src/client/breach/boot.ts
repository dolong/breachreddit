/**
 * Hands bundled Breach components to the dc-runtime.
 *
 * The runtime (generated/dc-runtime.js) expects React/ReactDOM on window and
 * normally fetches + evals everything at runtime. Here each component's source
 * and logic class is already in the bundle (generated/c-*.js), so nothing
 * leaves the origin and nothing is eval'd — both hard requirements inside
 * Reddit's webview.
 *
 * The runtime is patched not to self-start: in a production build it lands in
 * a shared chunk that executes before any entry code. prepareDc() sets the
 * globals and then starts it, so ordering never depends on the bundler.
 */
import './generated/dc-runtime.js';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

export type DcComponent = {
  name: string;
  source: string;
  logic: ((DCLogic: unknown, StreamableLogic: unknown, React: unknown) => unknown) | null;
};

declare global {
  interface Window {
    __dcLogicFactories?: Record<string, DcComponent['logic']>;
    __resourceBlobs?: Record<string, Blob>;
    __dcBootSrc?: string;
    __dcBootName?: string;
    __dcBootProps?: Record<string, unknown>;
    __dcStart?: () => Promise<void>;
  }
}

/** Boot `root` as the page; `siblings` resolve its <dc-import>s; `props` override its prop defaults. */
export const startDc = (root: DcComponent, siblings: DcComponent[] = [], props: Record<string, unknown> = {}) => {
  // @types/react-dom already types a global ReactDOM; the runtime only needs createRoot.
  Object.assign(window, { React, ReactDOM: { createRoot, version: ReactDOM.version } });
  const factories: Record<string, DcComponent['logic']> = {};
  const blobs: Record<string, Blob> = {};
  for (const c of [root, ...siblings]) {
    if (c.logic) factories[c.name] = c.logic;
    // Key format matches the runtime's sibling URL: COMPONENT_DIR + "/" + encodeURIComponent(name) + ".dc.html"
    if (c !== root) blobs[`./${encodeURIComponent(c.name)}.dc.html`] = new Blob([c.source], { type: 'text/html' });
  }
  window.__dcLogicFactories = factories;
  window.__resourceBlobs = blobs;
  window.__dcBootName = root.name;
  window.__dcBootSrc = root.source;
  window.__dcBootProps = props;
  if (!window.__dcStart) throw new Error('[breach] dc-runtime not loaded');
  void window.__dcStart();
};
