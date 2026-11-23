- **ID:** DL:memur-payslip-reconstruction-2026-11
- **Subject:** memur, tr-2026, kesenek-5434, gss, income-tax, stamp-tax, payslip
- **Claim:** A real Nov-2026 KBS payslip (GİH zabıt katibi, 1/2, ek gösterge 2800, 19 yrs, 5434) is reproduced from the Jul–Dec 2026 coefficients for every line except stamp tax (±0,01).
- **Evidence date:** 2026-11-23
- **Status:** live
- **Contributed-by:** operator-approved

## Hypothesis
Each payslip line is a coefficient × indicator (or rate × EDMA) and can be recomputed exactly.

## Evidence (anonymised; operator-supplied KBS "Personel Bordro Bilgileri", Kasım 2026; no identifiers kept)
Coefficients: aylık K = 1,575512; taban T = 25,794915; yan ödeme Y = 0,499649; EDMA = 9.500 × K = 14.967,36.

| Line | Payslip | Rule | Recomputed |
|---|---|---|---|
| Aylık tutar | 2.174,21 | gösterge 1380 (1/2) × K | ✓ |
| Ek gösterge | 4.411,43 | 2800 × K | ✓ |
| Taban aylık | 25.794,92 | 1000 × T | ✓ |
| Kıdem aylığı | 598,69 | 19 yıl × 20 × K | ✓ |
| Yan ödeme | 649,54 | 1300 puan × Y | ✓ |
| Özel hizmet tazminatı | 16.464,10 | %110 × EDMA | ✓ |
| Ek ödeme (666 KHK) | 16.464,10 | %110 × EDMA | ✓ |
| İlave ödeme (375/40) | 25.153,05 | fixed amount (= 15.965 × K) | ✓ value; rule unconfirmed |
| Çocuk yardımı | 393,88 | 250 × K (child over 6) | ✓ |
| Aile yardımı | 0 | spouse works (operator-confirmed) | ✓ |
| Toplu sözleşme ikramiyesi | 1.113,89 | rule unknown (≈ 707 × K) | — |
| Kesenek matrahı (5434) | — | gösterge + ek g. + kıdem + taban + %85 × EDMA = 45.701,51 | — |
| Emekli keseneği kişi | 7.312,24 | %16 × matrah | ✓ |
| Emekli keseneği devlet / Em.Kes.Karşılığı | 9.140,30 | %20 × matrah (paid in, then deducted) | ✓ |
| GSS devlet | 5.484,18 | %12 × matrah (paid in, then deducted); GSS kişi 0 | ✓ |
| Aylık vergi matrahı | 25.852,43 | aylık + ek g. + taban + kıdem + yan ödeme − kesenek kişi − sendika aidatı | ✓ |
| Gelir vergisi | 0 | cumulative 243.795,48 → 269.647,91 (20% bracket) tax 5.170,49; MW exemption capped at that (Nov full exemption would be 5.615,10) | ✓ |
| Damga vergisi | 453,84 | 0,759% × (gelir toplamı − em.kes.karşılığı − GSS devlet − çocuk yardımı) − 250,70 = 453,83 | ✗ 0,01 |
| Net | 84.987,61 | gelir − kesintiler | ✓ given DV |

## Verdict
Accepted for this profile. Not yet generalised: the %85 EDMA share in the kesenek base, the %110 ÖHT/ek ödeme rates and the
1300 yan ödeme points are profile-specific (zabıt katibi, ek gösterge 2800) until confirmed for other titles; 5510-covered
staff (entered after 1 Oct 2008) use different deductions. Stamp-tax rounding open: `deferred:memur-stamp-tax-rounding`.

## Cross-links
DOMAIN_REF "Turkey civil-servant payroll"; L1; L2 2026-11-23.
