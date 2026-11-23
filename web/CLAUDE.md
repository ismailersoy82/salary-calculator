# web — bilingual (TR/EN) browser UI for the salary calculator

Static HTML/CSS/vanilla JavaScript (ES modules), no build step and no framework. Served as-is by GitHub Pages from
the repo root (`DEC:publish-repo-root`). Entry point: `web/index.html`. Talks to no external system; it imports
`../rules/calc.js` and fetches `../rules/tr/2026.json`.

## Key Files
- `index.html` — page shell: form, result breakdown, 12-month table, sources
- `app.js` — amount parsing (TR `50.000,50` and EN `50,000.50`), rendering, TR/EN switch (~130 LOC)
- `i18n.js` — all TR/EN strings
- `style.css` — light/dark, responsive down to 320 px

## Architecture Notes
- Never hardcode a statutory number (rate, bracket, ceiling, minimum wage) in this component — read it from `rules/`.
- UI text is bilingual; every user-visible string goes through the i18n layer.
- No user data leaves the browser; no analytics or external calls without an explicit decision.

## Build
- No build step; serve the repo root over HTTP (see `.salvor/INFRA.md`). Display values exactly as `rules/calc.js`
  returns them — never recompute in the UI.

For domain logic: see `.salvor/DOMAIN_REF.md`. For infra/ops: see `.salvor/INFRA.md`.
