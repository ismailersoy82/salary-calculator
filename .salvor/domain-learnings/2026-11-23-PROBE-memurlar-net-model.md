- **ID:** DL:memurlar-net-adalet-model
- **Subject:** memur, 5510, income-tax, adalet, sources, memurlar.net
- **Claim:** memurlar.net's calculator deducts both employee MYÖ (9%) and GSS (5%) from the 5510 income-tax base, and adds a 15% "İl Adalet Hizmetleri Tazminatı" to Adalet titles (also inside the prime base) — a line absent from a real taşra-adliye payslip.
- **Evidence date:** 2026-11-23
- **Status:** live
- **Contributed-by:** operator-approved

## Hypothesis
memurlar.net's per-title Adalet pages are a usable source for preset titles.

## Evidence (memurlar.net maaş robotu, viewed 2026-11-23, Jul–Dec 2026 coefficients, 1/1, BES 3%)
| Title | Ek g. | Yan ödeme | ÖHT | Ek ödeme | İl adalet | GV matrahı printed | Recomputed |
|---|---|---|---|---|---|---|---|
| Memur (2 yıllık YÖ) | 2800 | 500 | 56% | 110% | 15% | 26.528,05 | 32.535,85 − MYÖ 3.862,16 − GSS 2.145,64 = 26.528,05 ✓ |
| Zabıt katibi (lise) | 2100 | 1300 | 100% | 110% | 15% | 25.057,32 | 31.832,72 − 4.355,61 − 2.419,78 = 25.057,33 (±0,01) |
| Şef | 2800 | 1150 | 132% | 115% | 15% | 25.260,29 | — |
MYÖ base for memur = gösterge + ek g. + taban + ÖHT + il adalet (42.912,85 → 9% = 3.862,16).
The operator's real payslip (taşra adliye, zabıt katibi, lisans, 1/2) shows ÖHT 110% and no il adalet line.

## Verdict
Mixed. (1) Supports — does not prove — the 5510 tax-base rule already used (`taxDeductsGss = true`). (2) The il adalet
line is contradicted by a real taşra payslip, so it is not used. memurlar.net does not include the monthly
toplu sözleşme ikramiyesi that the real payslip shows.

## Consequence
Operator decision: add Adalet memur and şef (derece 1) as **estimate** presets from memurlar.net without the il adalet
line, 5510 only (5434 pension share unknown), with an in-page warning pointing to payslip mode. Not added: VHKİ
(memurlar.net page is not Adalet-specific).
