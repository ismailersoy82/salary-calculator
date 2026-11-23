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
