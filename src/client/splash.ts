// Post View (inline): the "Choose an adventure" card screen from
// breach-concept/Postview.dc.html. Its CTA links to the full game
// (ctaHref = "Space Dice Run v15.dc.html"); here that link opens the
// expanded "game" entrypoint instead of navigating the iframe.
import './breach.css';
import './breach/env-splash';
import './breach/generated/dc-runtime.js';
import { requestExpandedMode } from '@devvit/web/client';
import { isGameLink } from './breach/links';

document.addEventListener(
  'click',
  (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
    if (!a || !isGameLink(a.getAttribute('href'))) return;
    e.preventDefault();
    e.stopPropagation();
    requestExpandedMode(e, 'game');
  },
  true
);
