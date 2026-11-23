# rules — versioned tax/social-security parameters and pure calculation functions

Plain JSON parameter files, one per country and effective year (e.g. `rules/tr/2026.json`, planned), plus pure
JavaScript functions that turn a gross salary into net pay using those parameters. No UI, no I/O, no external calls.

## Key Files
- `tr/2026.json` — Turkey 2026 parameters with per-block sources
- `calc.js` — pure gross→net functions: `calcMonth`, `calcYear`, `incrementalTax`, `cumulativeTax` (~100 LOC)
- `tests/tr-2026.test.mjs` — known-answer tests (official monthly amounts / hand derivations only)
- `memur.js` — civil-servant payroll (`calcMemurMonth`, 5434/5510), `ruleFromPayslip` (`DEC:payslip-mode`), `raiseFactor`, `projectPeriod`
- `tr/memur/2026-h2.json` — memur coefficients, 43/A gösterge table, indicators (unverified ones are null/flagged)
- `tr/memur/titles.json` — per-title, per-derece ek gösterge / yan ödeme / ÖHT / ek ödeme / pension EDMA share
- `tr/cpi.json` — official monthly CPI only; scenarios are UI inputs, never stored
- `tests/tr-memur.test.mjs` — reproduces an anonymised real Nov-2026 payslip

## Architecture Notes
- Every parameter carries its official source and effective date; a new year is a new file, never an in-place edit of
  a past year.
- Calculation functions are pure: same inputs → same outputs, no hidden state.
- Adding a country must not change another country's results.
- Money is integer kuruş, rates per 100,000 — see `DEC:integer-kurus-arithmetic` and `LF:float-half-kurus-rounding`.

## Build
- No build step. Tests: `node --test rules/tests/*.test.mjs`.

For domain logic: see `.salvor/DOMAIN_REF.md`. For infra/ops: see `.salvor/INFRA.md`.
