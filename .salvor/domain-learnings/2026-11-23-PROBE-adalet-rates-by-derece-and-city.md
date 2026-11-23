- **ID:** DL:adalet-rates-by-derece-and-city
- **Subject:** memur, adalet, zabıt-katibi, special-service-allowance, regional-allowance, 5510, income-tax, sources, memurlar.net
- **Claim:** Adalet GİH staff get İl Adalet Hizmetleri Tazminatı 15% × EDMA only in İstanbul/Ankara/İzmir; elsewhere there is no such line and ÖHT is 10 points higher. The zabıt katibi rates by derece are ÖHT 100/100/100/75/63…/61, ek gösterge 2800/2200/1700/1400/0, ek ödeme 110/110/100/100/90/85, yan ödeme 1300.
- **Evidence date:** 2026-11-23
- **Status:** live
- **Contributed-by:** operator-approved

## Hypothesis
The 15% il adalet line in public calculators contradicts real taşra payslips, i.e. the calculators are wrong.

## Evidence
1. Published zabıt katibi career table (saffetcelik.com.tr "Zabıt Katibi Maaşı 2026", İst/Ank/İzm, 5510, bekâr,
   Jul–Dec 2026, BES 3% of prime base, no toplu sözleşme ikramiyesi): all 12 nets reproduced by `rules/memur.js`
   within 0,01 (stamp-tax rounding) — 9/1 70.102,15 … 1/4 83.785,82, plus 10/2 69.830,11 and 13/3 69.752,54. Solving
   each step left exactly one (ek gösterge, ÖHT) pair per derece (3/1 had a second, implausible pair 3600/80%;
   the source text states 1700/100%).
2. The same source states the 15% il adalet allowance is paid in İstanbul, Ankara and İzmir.
3. Operator's real payslip (taşra adliye, zabıt katibi 1/2): ÖHT 110 = 100 + 10, no il adalet line — consistent with
   Hakem Kurulu 2025/1 md. 65 (+10 on the tazminat rate for GİH/YH staff without other additions).
4. Absorbed from DL:memurlar-net-adalet-model (provenance below): memurlar.net's printed GV matrahı for Adalet
   memur 1/1 and zabıt katibi (lise) 1/1 is reproduced only if both employee MYÖ 9% and GSS 5% are deducted (5510);
   its MYÖ base includes the il adalet line. memurlar.net's Adalet pages model the big-city variant.

## Verdict
Hypothesis falsified: no contradiction — the calculators model big cities, the payslip is taşra. Encoded in
`rules/tr/memur/titles.json` as `locations` (bigCity: +15% regional line; other: ÖHT +10). Only "other, zabıt katibi
d1, 5434" is payslip-verified; the +10 rule for other dereceler and titles is inferred.

## Provenance
Supersedes `DL:memurlar-net-adalet-model` (same day), whose verdict (2) "il adalet line contradicted by a real
payslip" was a location effect. Its 5510 tax-base evidence is carried over in item 4. Merge approved by the
operator via the §10.2 gate.

## Cross-links
`rules/tests/tr-memur.test.mjs` (career-table and taşra tests); DOMAIN_REF "Turkey civil-servant payroll".
