# Pool of Experts

A serious game about who gets to decide what a piece of Vienna becomes.
Built for the course **Web Experiences for the Digital Humanities** (University of Vienna, 2026).

**Play:** https://annek77.github.io/GAME-6/ — runs in the browser, no install, no backend, no account.

## What it is

You lead the project to turn the old WU campus at the Augasse into a new education campus.
Six stations lie between the decision and the opening day. The prototype plays the first —
appointing the expert advisory board that decides which design wins — and the second, the
neighbourhood. Stations three to six are visible and locked; a click shows what would happen there.

The board is the heart of the prototype. The brief lists five terms. The Chamber nominates three
of nine members. You pick the other six from 23 candidates, covering six mandatory fields within a
budget. Then the outside world looks at the result — and the game shows you what was in your
briefing all along. Nobody makes you do anything. Every way forward is voluntary, and every one
costs something: time, reputation, or the money you wanted to build with.

The competition for Campus Althangrund is real. At the end of station one the game puts your board
next to the actual jury, with sources.

## Facts

Every rule, figure and quotation in the game is documented. The brief's terms, the Chamber's
nomination rule, the real jury, the three figures and the dossier all come from primary sources
listed in `rules.js` (`SOURCES`) and in `recherche/`. Nothing legal or statistical was invented;
the game's own texts (newspapers, voices, station previews) are fiction and marked as such in
`KONZEPT-STAND.md`.

## Files

```
index.html   markup only; loads the scripts below (with cache-busting ?v=)
style.css    all styling
data.js      26 architect profiles (6 women / 20 men) — hidden metadata, never shown
rules.js     everything factual and tunable: budget, fees, brief terms, chamber rule,
             fields, compensations, PR actions, stations, echoes, previews, real jury,
             figures, sources, dossier
art.js       all SVG illustrations (old WU by day and night, newspapers, pool, new WU in
             four finishes)
sound.js     Web Audio layer, no audio files; mute button in the title bar
game.js      screens and state
parked-events.js  not loaded — pressure events from an earlier version, kept for reference
KONZEPT-STAND.md  design document (German) — the authoritative description of the game
TEST-ANLEITUNG.md playtest instructions for the team (German)
recherche/   the fact research behind rules.js (German, with retrieval dates)
```

## Run locally

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Test jumps for reviewers: append `#pr`, `#reveal`, `#options`, `#realworld`, `#map`,
`#latestations` or `#outro` to the URL to start at that screen with a pre-filled board.

## Accessibility

Keyboard: `Y` / `M` / `N` and `←` on the candidate deck, `Tab` + `Enter` on cards, visible focus
rings, `aria-live` cockpit. `prefers-reduced-motion` is respected. Sound is optional.

## Team

Anne Kinigadner (game), Kathi and Jana (concept, paper). Prototype status: station 1 complete,
station 2 playable, stations 3–6 previewed. See `KONZEPT-STAND.md` §10 for what is still open.

The game uses woman/man as simplified analytical categories to make one form of selection bias
visible; it does not claim that gender is binary.
