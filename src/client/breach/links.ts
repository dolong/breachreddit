/** True for an href that points at the full game (Postview's CTA target). */
export const isGameLink = (href: string | null): boolean =>
  !!href && /space\s*dice\s*run[^/]*\.dc\.html$/i.test(decodeURIComponent(href));
