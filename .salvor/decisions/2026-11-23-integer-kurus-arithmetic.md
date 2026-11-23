- **ID:** DEC:integer-kurus-arithmetic
- **Subject:** rules, calc.js, rounding, income-tax, stamp-tax, sgk
- **Claim:** All money in `rules/calc.js` is computed in integer kuruş with rates as integers per 100,000; each component is rounded half-up to the kuruş once.
- **Evidence date:** 2026-11-23
- **Status:** live
- **Contributed-by:** operator-approved

## Context
Turkish payroll amounts routinely land on half a kuruş (28,075.50 × 15% = 4,211.325). Binary floating point represents
these as …324999…, and taking differences of large cumulative totals amplifies the error, so a naive implementation
rounds the wrong way. See `LF:float-half-kurus-rounding`.

## Decision
Convert TL to integer kuruş (`toKurus`), rates to integers per 100,000 (`rateInt`; covers the stamp-tax rate 0.00759),
multiply in integers, and round once per component (`mulRate`, `incrementalTax`). Monthly income tax is computed by
splitting the month's base across brackets (`incrementalTax`), not by subtracting two cumulative-tax floats.

## Rationale
Results must match published payroll figures to the kuruş (minimum-wage exemption 4,211.33; net minimum wage
28,075.50; employer cost 40,874.63). Integer arithmetic is exact for these magnitudes and gives deterministic half-up
rounding.

## Invariant
Do not "simplify" calc.js back to plain floating-point multiplication or to `cumulativeTax(after) − cumulativeTax(before)`
for monthly amounts. Any new rate must have at most 5 decimal places (per-100,000 resolution) or `rateInt` must change.

## Coupling / blast radius
`rules/calc.js` (all exported functions); every future country file; `rules/tests/` known-answer tests. The `web`
component must display values as returned, not recompute them. (Core mode: no GitNexus impact analysis available.)

## Alternatives rejected
- Floating point with `Math.round(x * 100) / 100` at the end — fails on cumulative differences (observed).
- A decimal library — adds a dependency to a no-build static site for no gain over integer kuruş.
