import { describe, expect, it } from 'vitest';
import { forceStartScreen, SAVE_KEY } from './start-screen';

const mem = (init?: unknown) => {
  const m = new Map<string, string>();
  if (init !== undefined) m.set(SAVE_KEY, typeof init === 'string' ? init : JSON.stringify(init));
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
};

describe('forceStartScreen', () => {
  it('sends a mid-run save back to the title screen, keeping everything else', () => {
    const s = mem({ screen: 'board', meta: { energy: 3 }, run: { sector: 2 } });
    forceStartScreen(s);
    expect(JSON.parse(s.m.get(SAVE_KEY)!)).toEqual({ screen: 'title', meta: { energy: 3 }, run: { sector: 2 } });
  });
  it('leaves fresh, already-title, and corrupt saves alone', () => {
    const fresh = mem();
    forceStartScreen(fresh);
    expect(fresh.m.size).toBe(0);
    const corrupt = mem('{not json');
    forceStartScreen(corrupt);
    expect(corrupt.m.get(SAVE_KEY)).toBe('{not json');
  });
});
