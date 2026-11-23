# SalaryCalc Infrastructure

Operational reference: running locally, deployment, env vars, external APIs, observability.

## Local
Static site — open `web/index.html` in a browser; no server or build step required.
Tests: `node --test rules/tests/*.test.mjs` (Node 22, built-in test runner, no dependencies). Root `package.json`
only sets `"type": "module"`.

## Deployment
GitHub Pages (planned) from repo `ismailersoy82/salary-calculator`. No secrets.

## Env vars
None.

## External APIs
None — all parameters ship as static files in `rules/`.

## Observability
None (no analytics by design).
