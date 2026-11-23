# rules — versioned tax/social-security parameters and pure calculation functions

Plain JSON parameter files, one per country and effective year (e.g. `rules/tr/2026.json`, planned), plus pure
JavaScript functions that turn a gross salary into net pay using those parameters. No UI, no I/O, no external calls.

## Key Files
- `tr/` — Turkey parameters by year (planned)
- `calc.js` — pure gross→net functions (planned)
- `tests/` — known-answer tests against official examples (planned)

## Architecture Notes
- Every parameter carries its official source and effective date; a new year is a new file, never an in-place edit of
  a past year.
- Calculation functions are pure: same inputs → same outputs, no hidden state.
- Adding a country must not change another country's results.

## Build
- No build step. Tests: to be defined with the first calculation code.

For domain logic: see `.salvor/DOMAIN_REF.md`. For infra/ops: see `.salvor/INFRA.md`.
