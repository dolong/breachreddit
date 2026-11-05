# Breach — Planet Conquest Spec

Oct 31, 2026 · @Long

## Overview

Every finished run knocks down one planet's domination bar. When a bar empties, the planet falls and unlocks the card it holds. Planets are grouped into star systems, and after each run you pick 1 of 3 planets from the current system to hit.

The pass has four goals:

- **Every run moves the map.** Failed runs count too.
- **Fleet and prestige pay off at run end.** Both feed the hit, not just the score.
- **One unlock path.** Planets are the only way to get new cards.
- **A Balatro-style payoff.** Fleet score × rank lands on a planet, and the card breaks free.

The current cards stand in as planet rewards until new cards are designed. Swapping one later only changes the card listed on its planet.

## What changes

Nothing gets deleted in this pass. Systems being retired are switched off behind flags, and they stay in the code until you approve removing them.

| System | Today | After this pass |
| --- | --- | --- |
| Card unlocks | Sector clears (1–12) and feats | Planet conquest only; clears and feats are kept as stats |
| Upgrades screen, CARDS tab | 6 prestige cards, all marked "coming next pass" | Tab hidden; its 6 cards move onto planets |
| Run-end deployment | Ships deploy against rival planets: YOU HOLD / REINFORCED / CONTESTED | Off behind a flag; replaced by the Conquest stage |
| Rival planets and ticker | Vesper, Kessel, Hollow and Ixion held by @nova and others | Rivals off; the four planets become System 1 |
| Galaxy view (hangar) | Planet control and strength | Becomes the Dominion map |
| Contracts board | Daily asks, delivered from the fleet for prestige | Off behind a flag (see Open decisions) |
| Parade FLEET SCORE | Run-end count-up | Kept; becomes the base of the hit |
| Run ranks | Set by run prestige | Kept; each rank gains a multiplier |
| Receipt | Run-end lines | Gains conquest lines |
| Codex | Locked cards show "CLEAR N SECTORS" | Locked cards show their planet and its bar |
| New-card reveal | ★ NEW ADVENTURE FOUND | Reused for planet unlocks |

## Card unlocks

20 cards start locked: the 14 adventure cards that clears and feats unlock today, plus the 6 cards from the Upgrades shop. The 9 base cards stay open from the first run: Distress Beacon, Salvage, Toll Lane, Vent, Secret Data, Cargo Sweep, Deep Scan, Asteroid Field and Hazard Run.

- **Unlocking.** A card unlocks when its planet falls. `isUnlocked` checks conquered planets instead of `clears` and `feats`.
- **First appearance.** The newest unlock is pinned into the first adventure offer of the next run, one time only, so players get to try it straight away.
- **Codex.** Vetoes and pins work as they do today.
- **The six Upgrades cards** (Prestige Dump, Black Market, Bribe the Dock, Contraband, Ghost Freighter and Insurance) aren't built yet; the shop marks them "coming next pass". System 4 can't be played until they are.
- **Old saves.** Cards a save has already unlocked stay unlocked, and their planets start out conquered.

## Star systems and planets

The Dominion has 4 star systems and 20 planets, one card per planet. Only the current system is in play, and taking its last planet opens the next one. Cards follow today's unlock order, so the cards that once needed more clears now sit deeper in the map.

| System | Planets | Cards held |
| --- | --- | --- |
| 1 | 4 | Convoy (Vesper), Escort Convoy (Kessel), Shield Array (Hollow), Smuggler (Ixion) |
| 2 | 5 | Ion Storm, Wormhole, Hold Position, Trade Post, Debris Field |
| 3 | 5 | Mayday, Derelict, Overclock, Bounty Hunt, Bounty Board |
| 4 | 6 | Prestige Dump, Black Market, Bribe the Dock, Contraband, Ghost Freighter, Insurance |

- **System 1** reuses the four existing planets with their names and art. Their rivals are gone.
- **Systems 2–4** need planet names. Until new art arrives, they use palette swaps of the four planet sprites.
- **System complete.** When a system's last planet falls, play a SYSTEM CONQUERED beat, then reveal the next system on the map.
- **Dominion complete.** After System 4, runs skip the Conquest stage and the map shows DOMINION COMPLETE. New systems get added as new cards are designed.

## Run-end domination

The hit is fleet score times the rank multiplier, with a minimum of 25.

```latex
\text{Domination} = \max(\text{CHIP\_FLOOR},\ \text{fleet score} \times \text{rank multiplier})
```

- **Fleet score** is the parade's existing FLEET SCORE: the ship points (10–20 per ship) of every ship launched this run and still alive. Ships lost to bosses don't count.
- **Rank multiplier** comes from the highest run rank reached (table below).
- **Every ending counts:** clearing Sector 3, breaching out, or dying to a boss. A run with no ships left still hits for the minimum.
- **Overkill spills.** If the hit is bigger than what's left on a planet, the player picks another planet from the same offer to take the excess. This repeats until the hit is used up or all three offered planets fall. Anything left over shows in the receipt as OVERKILL and is lost.

| Rank | Run prestige | Multiplier |
| --- | --- | --- |
| Ensign | 0 | ×1 |
| Squad Leader | 8 | ×1.2 |
| Lieutenant | 25 | ×1.4 |
| Sr. Lieutenant | 50 | ×1.6 |
| Lt. Commander | 80 | ×1.8 |
| Commander | 120 | ×2 |
| Captain | 170 | ×2.5 |
| Commodore | 230 | ×3 |
| Vice Admiral | 300 | ×3.5 |
| Admiral | 400 | ×4 |

For example, 22 surviving ships worth 290 points at Commander hit for 580. Against System 2, where each planet holds 400, that hit takes one planet and spills 180 into a second.

## The planet offer

Once the hit is totaled, the player picks 1 of 3 planets from the current system. You never pick a target before the run.

- **Each planet card shows** its art and name, the card it holds (face-up but sealed), its domination bar as remaining / total, and a preview of this hit, such as "−580 → FALLS" or "−580 → 36% LEFT".
- **Chipped planets stick.** A planet you've damaged stays in the offer until it falls. The open slots draw at random from undamaged planets in the system.
- **Short systems.** With fewer than 3 planets left, the offer shows only what remains.
- **No rerolls at launch.** If playtesters get frustrated, the fallback is 1 reroll per system.

**Phase 2, off by default: planet traits.** Each planet doubles the points of one ship type for its hit; for example, a hauler world counts Barnacles ×2. The offer then shows each planet's hit with its trait applied, so your fleet's makeup decides which planet you hit hardest.

## Run-end flow

The Conquest stage takes the place of today's rival deployment, between the parade and the receipt. It reuses existing juice wherever it can, and no current animation is removed.

1. **Run ends:** the final gate is cleared, the player breaches out, or a boss wins.
2. **Parade:** as today, ships fly through the gate while FLEET SCORE counts up on the ladder pitch. Endings without a final gate run a short count-up of surviving ships in place.
3. **Rank slam:** the rank emblem drops in, "×2" slams down beside FLEET SCORE, and the product counts up into a big DOMINATION number. Reuse the stamp and land clips.
4. **Offer:** three planets pop in with the existing planet-pop animation and clip. The player taps one.
5. **Bombardment:** ships streak up from the bottom onto the planet in bursts while the bar drains, with counter-tick audio. The pace speeds up as the bar empties.
6. **Planet falls:** shake and flash using the old YOU HOLD juice, stamp PLANET TAKEN, and the planet turns the player's colour. The card breaks its seal and flies to the Codex with the existing new-card reveal and unlock clip.
7. **Planet holds:** stamp the percentage still left, such as "36% HELD". The planet stays in future offers.
8. **Overkill:** an OVERKILL +N banner appears and the remaining offered planets glow. The player taps one, and steps 5–7 repeat.
9. **System complete,** if the last planet fell: SYSTEM CONQUERED, then the next system appears.
10. **Receipt:** today's cash stage, with these new lines: fleet score, rank ×, domination, the hit on each planet, cards unlocked, and overkill lost.
11. **Home.**

Without overkill, steps 3–7 should take about 8 seconds. Tapping speeds everything up, as it does today.

## Dominion map

The Dominion map replaces the hangar's Galaxy view. The home screen gets a panel for the current system.

- **Home panel:** the current system's planets in a row. Each shows its bar, and conquered planets carry a flag in the player's colour. Tapping the panel opens the full map.
- **Full map:** all 4 systems. The current one is zoomed in; locked systems appear as silhouettes marked "?"; conquered ones are in the player's colour.
- **Planet detail:** tapping a planet shows the full card it holds (same view as the Codex), its domination as X / Y, and its status: untouched, chipped or taken.
- **Removed from view:** rival handles, the ticker, the income line, and the TODAY'S CONTRACTS panel on home, while those flags are off.

## Codex, Upgrades and Contracts

The Codex points at planets, Upgrades stops selling cards, and Contracts goes behind a flag.

- **Codex:** each locked card shows "HELD BY VESPER · SYSTEM 1" and that planet's bar in place of "CLEAR N SECTORS". Tapping it jumps to the planet on the map. New unlocks get a NEW badge until the player views them.
- **Upgrades:** the CARDS tab is hidden. HULLS, DEPOT, SECTORS, DOCKS, LOOKS and the paid extra run stay as they are. Depot unlocks still gate which epic parts bosses can drop.
- **Contracts:** off behind `CONTRACTS_ON = false`. Its planets and rivals no longer exist, so it can't run as it is. Launched ships keep going into the persistent fleet for the hangar, and Second Escort keeps working.

## Tuning and pacing

The target is about 40 runs to take all 20 planets. Every value below is a tunable constant, and the domination values are starting guesses built from ship points (10–20 each) and fleets of around 20 ships by Sector 3.

| Constant | Value | What it does |
| --- | --- | --- |
| `DOM_SYSTEM_SIZES` | \[4, 5, 5, 6\] | Planets per system |
| `DOM_HP` | \[150, 400, 800, 1400\] | Domination per planet, by system |
| `RANK_MULT` | ×1 to ×4 (Run-end domination table) | Multiplier per run rank |
| `CHIP_FLOOR` | 25 | Minimum hit per run |
| `OFFER_SIZE` | 3 | Planets offered |
| `OFFER_REROLLS` | 0 | Offer rerolls per system |
| `OVERKILL_SPILL` | true | Excess flows into another offered planet |
| `PIN_NEW_CARD` | true | Newest unlock appears in the next run's first offer |
| `PLANET_TRAITS` | false | Phase 2 ship-type bonuses |
| `TRAIT_MULT` | 2 | Points multiplier for a planet's favoured ship |

| System | Runs per planet | Runs to clear |
| --- | --- | --- |
| 1 | about 1 | about 4 |
| 2 | about 1.5 | about 8 |
| 3 | about 2 | about 10 |
| 4 | about 3 | about 18 |

**Simulation.** Run bot runs at three skill levels and record fleet score and peak rank for each run. Then set `DOM_HP` so a median player hits the runs-per-planet targets. Report the spread too: the best 10% of players should clear a System 1 planet in a single run, and the worst 10% should take no more than 3.

## Save data

The save gets one new block, `meta.dominion`, and existing keys stay where they are.

```
meta.dominion = {
  v: 1,
  system: 1,            // current system
  dmg: { vesper: 120 }, // damage dealt per planet id
  taken: ['kessel'],    // conquered planet ids
  offer: null,          // planet ids during an open offer
  pin: null             // card id to pin into the next run
}
```

- **`meta.unlocked`** still holds card ids, but conquest writes to it now. `clears`, `feats`, `con` and `tp.owned` are left untouched.
- **Migration:** for every card already in `meta.unlocked`, mark its planet as taken. Then set `system` to the first system that isn't complete.
- **Resume:** add run-end stages `conquest-offer` and `conquest-hit`, and save at each beat. A reload mid-conquest resumes at the offer with the hit intact, the same way `r.dep` stages restore today.
- **Debug panel:** add HIT 500, TAKE PLANET, NEXT SYSTEM and RESET DOMINION. The existing unlock-all and lock-all buttons should update the dominion block too.

## Acceptance checklist

The pass is done when every box below is ticked.

- [ ] On a new save, the 9 base cards are open and all 20 locked cards show their planet in the Codex.
- [ ] Every way a run can end reaches the Conquest stage, and the hit equals fleet score × rank multiplier, with a minimum of 25.
- [ ] The offer shows 3 planets from the current system, and a damaged planet stays in it until it falls.
- [ ] Overkill spills into a second planet the player picks from the same offer.
- [ ] Taking a planet unlocks its card, plays the reveal, and pins the card into the next run's first offer.
- [ ] Taking a system's last planet opens the next system.
- [ ] Upgrades has no CARDS tab, and every other tab still works.
- [ ] Rival deployment, the ticker and Contracts are switched off, and their code is still there.
- [ ] Old saves keep every card they had unlocked.
- [ ] Reloading mid-conquest resumes without losing the hit.
- [ ] No existing animation was removed; the parade and the new-card reveal are reused.
- [ ] The simulation report shows runs per planet for each system against the targets.

## Open decisions

Five calls need your sign-off. The spec uses the defaults below until you say otherwise.

1. **The six Upgrades cards.** I read "use those cards" as moving them onto System 4. They still need building. Bribe the Dock also spends prestige, which clashes with the no-spending rule, so I'd switch its cost to gold. If you meant to shelve all six, the map shrinks to 3 systems and 14 planets for now.
2. **Removals.** Rival deployment, the rival ticker, the Contracts board, and clear/feat unlocks are switched off behind flags. They only get deleted once you OK it.
3. **Planet traits.** Default is Phase 2. Turn them on now if you want fleet makeup to matter in the offer from day one.
4. **Persistent fleet.** With Contracts off, the meta fleet only shows up in the hangar. The options are to keep it as a trophy count or drop it.
5. **Names.** System names, and planet names for Systems 2–4.


> **Superseded Nov 5, 2026:** Long chose the daily rotation ("the new way daily"). One system a day on a local-midnight countdown, System 1 only 2 days a week, runs bank fleet into a pool, Your Planets -> Deploy -> Unlock. See `openPlanets`/`vPlanets` in breach-concept/Main.dc.html.
