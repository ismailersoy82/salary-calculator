- **ID:** DL:memur-rates-need-institution-and-period
- **Subject:** memur, titles, special-service-allowance, supplementary-payment, sources
- **Claim:** A civil-servant title's ÖHT and ek ödeme rates depend on institution and period, so a title is added only as (title, institution, period) from an official decision text or a real payslip.
- **Evidence date:** 2026-11-23
- **Status:** live
- **Contributed-by:** operator-approved

## Hypothesis
"Memur", "VHKİ" and "şef" each have one nationwide ÖHT / ek ödeme rate per derece that can be taken from a
published table.

## Evidence
- Real payslip, Adalet zabıt katibi 1/2: ÖHT 110%, ek ödeme 110% (`DL:memur-payslip-reconstruction-2026-11`).
- Diyanet table (secondary PDF): memur ÖHT 49%, ek ödeme 110/100/90 by derece; şef ÖHT 70 (60+7+3), ek ödeme
  115/105/95.
- Secondary 2026 calculator, 9/1 GİH memur: ÖHT 56%, ek ödeme 85% (its own breakdown also omitted the 620-point
  gösterge line — the "976,82 unexplained" gap).
- Secondary 2026 ek ödeme table: memur 110/100/90/85 by derece groups 1-2/3-4/5-7/8+; it notes institution-type
  differences and the Hakem Kurulu 2025/1 additions (e.g. md. 65: +10 on the tazminat rate for GİH/YH staff without
  other additions) for 2026–2027.

## Verdict
Falsified. Rates are institution- and period-specific. Secondary tables are leads, not sources.

## Consequence
`rules/tr/memur/titles.json` entries must name the institution and the period, and cite an official text or a payslip.
Operator chose Adalet Bakanlığı for memur / VHKİ / şef (same institution as the verified payslip).
