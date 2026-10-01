repo: dolong/spacedice
branch: main

## Last sync
date: 2026-09-20T23:23:52Z
### Updated in this project
- Ported the Balatro card lift (reference repo suniimartens/balatro-cards-effect-css, "loyal" variant) into Adventure Cards.dc.html
- Adventure cards animated as 24-frame sprite strips (assets/anim/); blueprint variants bp_2slot/bp_3slot cut from spaceui_blueprint.png
- Dice Roll.dc.html: CSS-cube tumble with predetermined result

## Sync history
- 2026-09-17T20:30:40Z — surveyed ship cards, cut user's blue ship into assets/ship_*.png variants, turn 2 docks them on the blueprints
- 2026-09-17T16:52:48Z — read Lua modules + HTML5 shell; copied blueprint cards, ship sprite/icon, space backdrop, dice, coin, star

## Screen map
| Screen | Repo files |
| --- | --- |
| Roll & build (1a/1b/1c) | modules/dice.lua, assets/spaceui_blueprint.png, assets/faces/*, assets/space.png, assets/coin.png, assets/spaceship_icon.png |
| Hangar (1d) | assets/spaceui_blueprint.png, assets/spaceui_blueprint-green.png, assets/spaceship1.png |
| Hull breach (1e) | assets/spaceui_blueprint.png |
| Supply depot (1f) | assets/spaceui_blueprint.png, assets/coin.png |
| Sector map (1g) | assets/space.png, assets/aliencard.png, assets/star.png, assets/spaceship_icon.png |
| Race result (1h) | assets/spaceship1.png, assets/coin.png |
| Title (1i) | assets/space.png, assets/spaceship1.png |
| Shell / sizing | js-web/Demo Space Dice/index.html |
