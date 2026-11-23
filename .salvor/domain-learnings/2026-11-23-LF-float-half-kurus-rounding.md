- **ID:** LF:float-half-kurus-rounding
- **Subject:** rules, calc.js, rounding, income-tax, minimum-wage-exemption
- **Claim:** Subtracting floating-point cumulative tax totals rounds half-kuruş amounts down (4,211.32 instead of 4,211.33).
- **Evidence date:** 2026-11-23
- **Status:** live
- **Contributed-by:** operator-approved

## Hypothesis
Monthly income tax can be computed as `round2(tax(cumAfter) − tax(cumBefore))` with ordinary JS numbers.

## Evidence
First implementation of `calcMonth` used that formula. Known-answer test "minimum wage exemption by month" failed in
month 4: actual 4,211.32, expected 4,211.33 (published amount; 28,075.50 × 15% = 4,211.325). Months 1–3 passed by
chance — the error depends on the size of the cumulative totals being subtracted.

## Verdict
Falsified. Root cause: binary floating point stores x.xx5 slightly below the half, and the subtraction of two large
totals exposes it before rounding.

## Fix
Integer kuruş arithmetic with bracket-split monthly tax — `DEC:integer-kurus-arithmetic`. Fix site:
`rules/calc.js` (`toKurus`, `rateInt`, `mulRate`, `incrementalTax`). Guarded by `rules/tests/tr-2026.test.mjs`
(all 12 monthly exemption values asserted, not just January).

## Cross-links
DOMAIN_REF `LF:float-half-kurus-rounding`; L1 LEARNED FAILURES; L2 2026-11-23.
