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
