import * as game from './generated/c-space-dice-run-v15.js';
import * as howToPlay from './generated/c-how-to-play.js';
import * as logo from './generated/c-breach-logo.js';
import { startDc } from './boot';
import { forceStartScreen } from './start-screen';

// Launched from the Post View CTA → always land on the start (title) screen.
forceStartScreen(localStorage);

// devClock is the concept's prototype "MOCK CLOCK · +1H · +1 DAY" bar for
// testing energy refills — keep it in the harness, hide it on Reddit.
startDc(game, [howToPlay, logo], import.meta.env.PROD ? { devClock: false } : {});
