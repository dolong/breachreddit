// Head scripts first: Main reads window.BreachAudio / window.BossSFX when it is constructed.
import './generated/audio-sprite.js';
import './generated/boss-sfx.js';
import * as game from './generated/c-main.js';
import * as jumpGate from './generated/c-jump-gate.js';
import * as bossFight from './generated/c-boss-fight.js';
import * as howToPlay from './generated/c-how-to-play.js';
import * as logo from './generated/c-breach-logo.js';
import { startDc } from './boot';
import { forceStartScreen } from './start-screen';

// Launched from the Post View CTA → always land on the start (title) screen.
forceStartScreen(localStorage);

// devClock is the concept's prototype "MOCK CLOCK · +1H · +1 DAY" bar for
// testing energy refills — keep it in the harness, hide it on Reddit.
startDc(game, [jumpGate, bossFight, howToPlay, logo], import.meta.env.PROD ? { devClock: false } : {});
