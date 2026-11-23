# SalaryCalc Domain Reference

Authoritative current-truth for domain logic. Artifacts in `.salvor/domain-learnings/` are frozen audit trails; this file is
what's currently true.

## Sections

### Turkey wage payroll (rules/tr/<year>.json + rules/calc.js)
Status: live (2026 params). Model: employee paid the same monthly gross since January, single employer, no incentives.
1. SGK base = gross clamped to [floor, ceiling] (2026: 33,030 – 297,270 = 9× minimum wage). Employee SGK 14% +
   unemployment 1% of the base. Employer 21.75% + 2% (no incentive) → employer cost.
2. Income-tax base = gross − employee SGK − unemployment. Tax uses the **ücret** tariff (GVK md. 103) on the
   **cumulative** annual base, so a constant salary pays more tax in later months.
3. Minimum-wage exemption (GVK 23/18): income tax a minimum-wage earner would owe this month on the same cumulative
   basis (2026: Jan–Jun 4,211.33, Jul 4,537.75, Aug–Dec 5,615.10); stamp tax exemption = stamp tax on gross minimum
   wage (2026: 250.70). Exemptions are capped at the tax computed.
4. Stamp tax = gross × 0.759%, minus the exemption.
5. Net = gross − SGK − unemployment − income tax − stamp tax.
6. Arithmetic: integer kuruş, see `DEC:integer-kurus-arithmetic`.
Out of scope (for now): incentives, part-month/mid-year starts, prior-employer cumulative base, AGİ (abolished 2022),
qualified-service-personnel exemption (334 Seri No.lu GV Genel Tebliği, 04.07.2026).

### Sources
Every parameter file carries its official source per block. Known-answer test values come from official monthly
amounts or hand derivations, never from press totals (`DL:official-monthly-exemptions-over-press-totals`).

## Learned Failures (LF:)
[One entry per failure mode, headed `### LF:<kebab-slug> (YYYY-MM-DD)`, opening with the structured header — Subject /
Claim / Evidence date / Status (RULES §10.1) — then root cause, fix sites, and a cross-link to the dated artifact in
`.salvor/domain-learnings/`. Update existing entries when a v1 fix is upgraded to v2 (RULES §6.9). Never two
contradictory `Status: live` entries — resolve per RULES §10.4.]

### LF:float-half-kurus-rounding (2026-11-23)
- **Subject:** rules, calc.js, rounding · **Claim:** float differences of cumulative tax round half-kuruş amounts down ·
  **Evidence date:** 2026-11-23 · **Status:** live
- Root cause: binary floating point stores x.xx5 just below the half; subtracting large cumulative totals exposes it.
- Fix sites: `rules/calc.js` (`toKurus`, `rateInt`, `mulRate`, `incrementalTax`). Guard: all 12 monthly exemption
  values asserted in `rules/tests/tr-2026.test.mjs`.
- Artifact: [domain-learnings/2026-11-23-LF-float-half-kurus-rounding.md](domain-learnings/2026-11-23-LF-float-half-kurus-rounding.md)
