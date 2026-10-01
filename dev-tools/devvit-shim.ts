/**
 * Devvit client shim — used only by `npm run dev:tools` so the real client
 * entries (src/client/splash.ts, game.ts) run outside the Devvit playtest.
 *
 * Vite aliases `@devvit/web/client` → this file when the devtools config
 * is active. In production builds the real `@devvit/web/client` is used.
 */

export const context = {
  username: 'dev-user',
  postId: 'dev-post',
  subredditName: 'dev-subreddit',
};

/**
 * Expanded mode is Reddit-only: on Reddit, Post View's CTA opens the "game"
 * entrypoint as the app view. The Farnsworth canvas can't host that yet, so
 * the harness just logs the request.
 */
export const requestExpandedMode = (_event?: Event, entry = 'game') => {
  console.log('[devvit-shim] requestExpandedMode:', entry);
};

export const navigateTo = (url: string) => {
  console.log('[devvit-shim] navigateTo:', url);
};

export const showToast = (message: string) => {
  console.log('[devvit-shim] showToast:', message);
};

export const showForm = (form: unknown) => {
  console.log('[devvit-shim] showForm:', form);
};

export const useDevvitContext = () => context;
