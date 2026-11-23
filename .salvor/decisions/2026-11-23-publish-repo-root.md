- **ID:** DEC:publish-repo-root
- **Subject:** web, rules, deployment, github-pages
- **Claim:** GitHub Pages publishes the repository root (main, /); `web/` imports `../rules/` directly, so `rules/` must ship alongside `web/`.
- **Evidence date:** 2026-11-23
- **Status:** live
- **Contributed-by:** operator-approved

## Context
The UI (`web/`) needs the calculation code and parameter files that live in `rules/`. The project has no build step.

## Decision
Publish the whole repository root with GitHub Pages ("Deploy from a branch", `main`, `/`). A root `index.html`
redirects to `web/`. `web/app.js` imports `../rules/calc.js` and fetches `../rules/<country>/<year>.json`.

## Rationale
One copy of the tax rules: the tested code in `rules/` is byte-for-byte the code the site runs. No copy step that could
drift, no bundler.

## Invariant
Never publish `web/` on its own (e.g. Pages source `/docs` or a `web/`-only artifact) and never copy `rules/` files into
`web/`. If deployment changes, `rules/` must still be served at `../rules/` relative to `web/`.

## Coupling / blast radius
`index.html` (root redirect), `web/app.js` (import + fetch paths), `.salvor/INFRA.md` (deployment), GitHub Pages
settings. Side effect: everything in the repo root is publicly served, including `.salvor/` and `RULES.md` — acceptable
because the repo is public and RULES §9 already forbids secrets in any memory file.

## Alternatives rejected
- Copy `rules/` into `web/` — two copies of statutory data, silent drift risk.
- GitHub Actions build step — more moving parts than a static site needs today.
