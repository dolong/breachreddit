import * as postview from './generated/c-postview.js';
import * as logo from './generated/c-breach-logo.js';
import { startDc } from './boot';

startDc(postview, [logo]);
