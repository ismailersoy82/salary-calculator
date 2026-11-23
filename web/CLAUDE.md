# web — bilingual (TR/EN) browser UI for the salary calculator

Static HTML/CSS/vanilla JavaScript, no build step and no framework. Served as-is by GitHub Pages. Entry point:
`web/index.html` (not yet created). Talks to no external system; it only imports parameters and calculation functions
from `rules/`.

## Key Files
- `index.html` — page shell (planned)
- `app.js` — form handling, language switch, result rendering (planned)
- `i18n/` — TR/EN UI strings (planned)

## Architecture Notes
- Never hardcode a statutory number (rate, bracket, ceiling, minimum wage) in this component — read it from `rules/`.
- UI text is bilingual; every user-visible string goes through the i18n layer.
- No user data leaves the browser; no analytics or external calls without an explicit decision.

## Build
- No build step; open `web/index.html` locally or publish via GitHub Pages (see `.salvor/INFRA.md`).

For domain logic: see `.salvor/DOMAIN_REF.md`. For infra/ops: see `.salvor/INFRA.md`.
