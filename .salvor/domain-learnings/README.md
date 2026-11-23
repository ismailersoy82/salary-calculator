# Domain Learnings

Frozen audit trail of every domain discovery, hypothesis test, vendor probe, and learned failure. Each artifact is dated,
categorized, and never edited after creation (DOMAIN_REF.md carries the living truth; these are the receipts).

## Naming convention
`YYYY-MM-DD-[CATEGORY]-[OUTCOME].md` — artifact ID `DL:<kebab-slug>` (or `LF:<kebab-slug>` for a Learned Failure
spec; RULES §10.1)

Categories (extend as needed):
- `PROBE` — exploration of an external system / vendor with a verdict
- `BAKEOFF` — A/B/N test of competing approaches with a verdict
- `LF` — Learned Failure spec with root cause + fix (carries the `LF:<slug>` ID registered in DOMAIN_REF)
- `ARCH` — empirical architecture probe with evidence and a verdict
- `MIGRATION` — pre-spec for a non-trivial change

## What goes here
- Structured header first: ID / Subject / Claim / Evidence date / Status (RULES §10.1)
- Hypothesis stated up front, in one sentence
- Evidence: what was tested, observed, what the data says
- Verdict: accepted / falsified / inconclusive
- Cross-links: spec → code commit → L1/L2 entries it updated

## Chronological index
| Date | ID | File | Category | Subject | One-line takeaway |
|------|----|------|----------|---------|-------------------|
| 2026-11-23 | LF:float-half-kurus-rounding | [2026-11-23-LF-float-half-kurus-rounding.md](2026-11-23-LF-float-half-kurus-rounding.md) | LF | rules, calc.js, rounding | Float differences of cumulative tax round half-kuruş down (4,211.32 vs 4,211.33) |
| 2026-11-23 | DL:official-monthly-exemptions-over-press-totals | [2026-11-23-PROBE-press-totals-unreliable.md](2026-11-23-PROBE-press-totals-unreliable.md) | PROBE | rules, tr-2026, test-data | Press annual total off by 5,000; test oracles come from official monthly amounts |
| 2026-11-23 | DL:memur-payslip-reconstruction-2026-11 | [2026-11-23-PROBE-memur-payslip-reconstruction.md](2026-11-23-PROBE-memur-payslip-reconstruction.md) | PROBE | memur, kesenek-5434, income-tax | Real Nov-2026 payslip reproduced line by line from coefficients; stamp tax off by 0,01 |
| 2026-11-23 | DL:memur-rates-need-institution-and-period | [2026-11-23-PROBE-memur-rates-vary-by-institution.md](2026-11-23-PROBE-memur-rates-vary-by-institution.md) | PROBE | memur, titles, sources | ÖHT/ek ödeme depend on institution+period; add titles only as (title, institution, period) from official text or payslip |
| 2026-11-23 | LF:css-display-overrides-hidden | [2026-11-23-LF-css-display-overrides-hidden.md](2026-11-23-LF-css-display-overrides-hidden.md) | LF | web, css, hidden | Author display rules beat [hidden]; force [hidden]{display:none!important}; review screenshots |
| 2026-11-23 | DL:memurlar-net-adalet-model | [2026-11-23-PROBE-memurlar-net-model.md](2026-11-23-PROBE-memurlar-net-model.md) | PROBE | memur, 5510, adalet, sources | SUPERSEDED-BY DL:adalet-rates-by-derece-and-city |
| 2026-11-23 | DL:adalet-rates-by-derece-and-city | [2026-11-23-PROBE-adalet-rates-by-derece-and-city.md](2026-11-23-PROBE-adalet-rates-by-derece-and-city.md) | PROBE | memur, adalet, regional-allowance, 5510 | Il adalet 15% only İst/Ank/İzm, else ÖHT +10; zabıt katibi rates for all dereceler solved from 12 published nets |
