/**
 * The Post View CTA ("ROLL YOUR FIRST ADVENTURE") should always open the game
 * on its start (title) screen. The concept's loadGame() restores whatever
 * screen was saved (board / map / depot…), so before the runtime boots we
 * rewrite only `screen` in the save. Meta progress (energy, bank, unlocks)
 * and the run object are left as-is.
 */
export const SAVE_KEY = 'spacedice-proto2'; // Space Dice Run v15 · SAVE_KEY

export const forceStartScreen = (storage: Pick<Storage, 'getItem' | 'setItem'>) => {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return; // fresh player: initGame() already starts on 'title'
    const save = JSON.parse(raw) as { screen?: string } | null;
    if (!save || typeof save !== 'object' || save.screen === 'title') return;
    save.screen = 'title';
    storage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // unreadable save: let the game's own loadGame() fallback handle it
  }
};
