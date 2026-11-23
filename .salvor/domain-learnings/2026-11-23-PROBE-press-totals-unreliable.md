- **ID:** DL:official-monthly-exemptions-over-press-totals
- **Subject:** rules, tr-2026, minimum-wage-exemption, test-data, sources
- **Claim:** Known-answer test values must come from official monthly amounts (or be derived by hand from them), not from press annual totals.
- **Evidence date:** 2026-11-23
- **Status:** live
- **Contributed-by:** operator-approved

## Hypothesis
A widely-cited 2026 press figure (annual income tax 91,547 TL for an employee earning twice the gross minimum wage)
is a reliable known answer for testing.

## Evidence
- Published monthly minimum-wage income-tax exemptions for 2026: Jan–Jun 4,211.33; Jul 4,537.75; Aug–Dec 5,615.10
  (Ocak tutarı GİB muhtasar ve prim hizmet beyannamesinde 4.211,33 / DV 250,70). Sum = 57,881.23, matching another
  published annual total.
- Hand check for gross 66,060/month: annual tax base 673,812 → tariff tax 144,429.24 → minus 57,881.23 = 86,548.01,
  which `calcYear` reproduces exactly.
- The press article states an annual exemption of 52,881; 144,429.24 − 52,881 ≈ 91,548 — the press number is consistent
  with a 5,000 TL slip in its exemption total.

## Verdict
Falsified as a test oracle. The press figure is not used; the test asserts 86,548.01 with the derivation in a comment.

## Cross-links
`rules/tests/tr-2026.test.mjs` (twice-minimum-wage test); `rules/tr/2026.json` `checkValues`; DOMAIN_REF "Sources".
