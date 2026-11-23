- **ID:** DEC:payslip-mode
- **Subject:** memur, payslip, titles, 5510, ux
- **Claim:** For any civil servant, rates are derived from the amounts on their own KBS payslip, recomputed, and every non-reconciling line is shown to the user as a warning — never silently absorbed.
- **Evidence date:** 2026-11-23
- **Status:** live
- **Contributed-by:** operator-approved

## Context
ÖHT / ek ödeme / yan ödeme rates depend on title, institution and period (`DL:memur-rates-need-institution-and-period`).
Even the best-known public calculator contradicts a real taşra-adliye payslip, so preset titles cannot be sourced
reliably from secondary tables.

## Decision
`rules/memur.js` `ruleFromPayslip(period, slip)` turns printed amounts (KBS line names: Ek Gösterge, Yan Ödeme, Özel
Hizmet Tazminatı, Ek Öde.(666 KHK), Aile/Çocuk Yardımı, Top.Sö.İkramiye, Emekli Keseneği (Kişi), Gen.Sağ.Sig.Pir.(Kişi),
Sendika Aidatı, Aylık Vergi Matrahı, Geçen Aylar Vergi Matrahı Toplamı) into indicators/rates; 5434 vs 5510 is detected
from a non-zero employee GSS line; for 5434 the title share × EDMA in the pension base is backed out of the printed
kesenek; for 5510 the GSS tax-deductibility is calibrated from the printed tax base. It then recomputes and returns
`checks` for anything that differs by more than 0,01. The memur page offers "Hazır unvan" and "Kendi bordromla" modes.

## Rationale
Works for every institution and title without a rate table; the user's own payslip is the most authoritative source
available; reconciliation makes wrong inputs or wrong rules visible.

## Invariant
Never drop or hide a `checks` entry in the UI. Derived rates are rounded to whole percents and points (tariff values);
if a future title needs fractional rates, change `ruleFromPayslip`, don't loosen the 0,01 reconciliation.
The payslip must be from the same period as the coefficients (Jul–Dec 2026 for `2026-h2.json`).

## Coupling / blast radius
`rules/memur.js` (`calcMemurMonth`, `ruleFromPayslip`), `rules/tr/memur/2026-h2.json` (`pension5510`),
`web/memur.html`, `web/memur.js`, `web/i18n.js` (`k_*`, `w_*`), tests in `rules/tests/tr-memur.test.mjs`.

## Alternatives rejected
- Preset rates from secondary tables — contradicted by a real payslip.
- Waiting for one payslip per title before offering anything — leaves most users without a calculator.

## Evidence
Reproduces the operator's 5434 payslip from printed amounts (net within 0,01). A published 5510 9/1 GİH breakdown is
reproduced exactly excluding BES (68.051,63 = 66.997,63 + 1.054 BES); its income tax is 0 either way, so the 5510
tax-base rule is still unverified (flagged to users unless they enter the payslip tax base).
