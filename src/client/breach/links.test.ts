import { describe, expect, it } from 'vitest';
import { isGameLink } from './links';

describe('isGameLink', () => {
  it('matches the Postview CTA target', () => {
    expect(isGameLink('Space Dice Run v15.dc.html')).toBe(true);
    expect(isGameLink('Space%20Dice%20Run%20v15.dc.html')).toBe(true);
    expect(isGameLink('./Space Dice Run v16.dc.html')).toBe(true);
  });
  it('ignores everything else', () => {
    expect(isGameLink(null)).toBe(false);
    expect(isGameLink('How To Play.dc.html')).toBe(false);
    expect(isGameLink('https://reddit.com')).toBe(false);
  });
});
