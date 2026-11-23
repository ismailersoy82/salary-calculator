# SalaryCalc Active State — VERBOSE ARCHIVE

L2 cache. Detailed but CURATED deep history of reasoning, rejected hypotheses, and condensed evidence pruned from L1.
Update trigger: immediately after every L1 update. Summarize command output — keep evidence, conclusions, and
commit/test/issue IDs, not raw dumps. Rotation: when this file exceeds ~1,500 lines, or at each release milestone,
condense the oldest resolved sections into brief summaries (keep durable conclusions, drop noise). Never persist
secrets, credentials, PII, or unredacted logs here (RULES §9) — redact before writing.

---

## 2026-11-23 — Project initialized
Initial Salvor scaffold: hub-and-spoke CLAUDE.md, L1/L2 cache, RULES.md §0–§10 (strict defaults DISABLED), three capture classes. Versioning owned by the minimal Salvor project-history file `VERSION.md` — no per-component counters.

Setup answers: project `SalaryCalc`; components `web` (static HTML/CSS/vanilla JS) + `rules` (versioned JSON parameters + pure JS calc); paired paths: none; Strict defaults: no. Mode: CORE — Serena and GitNexus CLIs absent in the setup environment, no MCP responding. Repo was empty at setup (no existing knowledge to adopt).

Project intent: bilingual TR/EN gross→net salary calculator, Turkey first, second country planned (~week 3). The project doubles as a real-world Salvor field trial; the January 2027 Turkish parameter change (minimum wage, income-tax brackets, SGK ceiling) is expected to exercise supersession.

## 2026-11-23 — TR 2026 parameters + calculation core
- Sources: Asgari Ücret Tespit Komisyonu 2025/1 (RG 26.12.2025); 332 Seri No.lu GV Genel Tebliği (RG 31.12.2025, 5. mük.)
  for the ücret tariff; SGK Genelgesi 2026/2 (07.01.2026) for base floor/ceiling (ceiling raised to 9× MW by 7566 s.K.);
  DV binde 7,59; MW exemption amounts per GİB beyanname update + sector publications. 334 Seri No.lu tebliğ (04.07.2026)
  checked: only qualified-service personnel, not modelled.
- Built `rules/tr/2026.json` (source string per block) and `rules/calc.js` (pure; calcMonth, calcYear, incrementalTax,
  cumulativeTax). Tests: `rules/tests/tr-2026.test.mjs`, 7/7 pass.
- Rejected: float `round2(tax(after) − tax(before))` — failed month-4 exemption (4,211.32). Captured as
  LF:float-half-kurus-rounding → DEC:integer-kurus-arithmetic (operator-approved).
- Rejected oracle: press annual income tax 91,547 for 2× MW; derivation gives 86,548.01 (press used a 52,881 exemption
  total vs official 57,881.23). Captured as DL:official-monthly-exemptions-over-press-totals (operator-approved).
- Field-trial note: three capture gates fired in the first coding session; asked as three separate questions.

## 2026-11-23 — Bilingual UI + GitHub Pages
- web/: index.html, app.js, i18n.js, style.css. Form (gross + month) → selected month breakdown (incl. exemptions,
  employer cost) + 12-month table + totals; TR/EN toggle remembered in localStorage (try/catch); light/dark.
- Amount parser accepts `66.060`, `50.000,50`, `50,000.50`, `50000`; rejects text; rejects gross < MW with message.
- Playwright headless Chrome: net for 66,060 in April = 49,958.78 in UI = calcMonth; 0 horizontal overflow at
  1280/360/320; first pass found a broken desktop form grid and a 320 px table clipping — both fixed and re-verified;
  favicon 404 removed.
- Deployment: repo root on Pages, root index.html redirects to web/ — DEC:publish-repo-root (operator-approved).

## 2026-11-23 — Civil-servant (memur) scope + first real payslip
- Operator scope: memur 9/1, VHKİ, şef, öğretmen, hemşire, polis memuru, zabıt katibi; inputs derece/kademe, hizmet
  yılı, mezuniyet, medeni durum/çocuk, branş; Jan 2027 projection from CPI.
- Web research: secondary calculators disagree for 9/1 (66.997 / 67.638 / 72.796 / 73.070 net); best breakdown found
  had a 976,82 TL unexplained gap → not used as oracle.
- Operator supplied an anonymised KBS payslip (Nov 2026, zabıt katibi 1/2, 5434). Reproduced every line except stamp
  tax (0,01) → DL:memur-payslip-reconstruction-2026-11; deferred:memur-stamp-tax-rounding (both operator-approved).
  Spouse works → aile yardımı 0 (operator-confirmed). Payslip image NOT stored (barcode/QR verification codes visible —
  operator warned).
- CPI so far: Jul–Oct 2026 cumulative 8,28% → excess over 7% ≈ 1,20%; Nov due early Dec, Dec due ~5 Jan 2027.

## 2026-11-23 — Memur engine
- rules/memur.js: integer kuruş; coefficient lines via indicator × coef(1e6) half-up; ÖHT/ek ödeme = rate × rounded
  EDMA; 5434 pension base incl. title-specific EDMA share; GV base per DL; DV ±0,01 (deferred). raiseFactor =
  (1+new) × max(1, cumCPI/(1+prevAgreed)); projectPeriod scales K/T/Y with 6-dp rounding.
- Data: rules/tr/memur/2026-h2.json (coefficients, 43/A gösterge table, indicators; spouse allowance null — sources
  disagree 1500 vs 2273; ilave ödeme 15965 and TS ikramiye 707 derived from the payslip, rule unverified),
  titles.json (zabıt katibi derece 1 only), rules/tr/cpi.json (Jul 1,78 · Aug 1,84 · Sep 1,84 · Oct 2,58; Nov/Dec pending).
- Tests 13/13 (6 new memur tests). Payslip lines exact; pension/GV exact; DV & net within 0,01.
- Capture gate: "only payslip-verified titles offered" → operator said NO; official tables are an acceptable source
  for adding titles. Not recorded as a decision.

## 2026-11-23 — Memur page live
- web/memur.html + memur.js; tab bar on both pages; i18n `m.*` strings TR/EN. 2026-H1 aylık katsayı moved into
  rules/tr/memur/2026-h2.json `previousPeriod` (UI must not hardcode statutory numbers).
- Playwright with the payslip profile: Kasım net 84.987,62 (payslip 84.987,61; known DV ±0,01), Jan-27 estimate
  91.775,03 at Nov/Dec 0,8% each (6-month 10,02%, catch-up 2,83%, raise 7,97%). Non-working spouse → clear "not
  verified yet" message. First pass: a global narrow-screen rule from the private page hid the memur table's Kasım
  column — scoped to #year; tab bar alignment fixed. 0 overflow at 1280/360/320, 0 console errors.
- DEC:one-page-per-calculator (operator-approved). Site LIVE on GitHub Pages since 2026-11-23 (operator enabled).
- Scheduled sessions created: 2026-12-03 10:41 (Nov CPI) and 2027-01-05 10:43 (Dec CPI, Jan-27 raise, 2027-H1
  genelge, TR 2027 params) — each must ask before commit and write a field-trial note.
