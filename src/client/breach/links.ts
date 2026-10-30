/** True for an href that points at the full game (Postview's CTA target: Main.dc.html, formerly Space Dice Run vN). */
export const isGameLink = (href: string | null): boolean =>
  !!href && /(^|\/)(main|space\s*dice\s*run[^/]*)\.dc\.html$/i.test(decodeURIComponent(href));
