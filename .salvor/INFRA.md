# SalaryCalc Infrastructure

Operational reference: running locally, deployment, env vars, external APIs, observability.

## Local
Static site, no build step. Serve the repo root over HTTP (`python3 -m http.server 8000`, then open
`http://localhost:8000/`) — opening `web/index.html` as a file fails because the parameter JSON is fetched.
Tests: `node --test rules/tests/*.test.mjs` (Node 22, built-in test runner, no dependencies). Root `package.json`
only sets `"type": "module"`.

## Deployment
GitHub Pages, "Deploy from a branch": `main`, `/` (repo root) — see `DEC:publish-repo-root`. URL:
`https://ismailersoy82.github.io/salary-calculator/` (root `index.html` redirects to `web/`). No secrets.
UI check: Playwright (headless Chrome) at 1280, 360 and 320 px wide + dark mode — zero horizontal overflow, no console errors.

## Env vars
None.

## External APIs
None — all parameters ship as static files in `rules/`.

## Observability
None (no analytics by design).
