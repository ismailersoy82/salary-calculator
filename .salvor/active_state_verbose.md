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
