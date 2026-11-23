# Deferred Findings

Out-of-scope findings intentionally **not** addressed when they surfaced — real, but not worth derailing the task they
were found in. Captured here so they don't slip into "I'll remember." Severity reflects "impact if left ~6 months," not
"broken today." See `RULES.md` §7 for the capture protocol.

<!-- Template for new entries (self-allocating slug ID — never a sequential number; RULES §10.1):

### deferred:<kebab-slug> — <short title>
- **Subject**: <tags: system / vendor / component the finding is about>
- **Where**: <file / location>
- **What**: <the issue>
- **Severity**: <Low | Medium | High>
- **Suggested fix**: <actionable suggestion>
- **Why deferred**: <why it was safe to skip now>
-->

### deferred:memur-stamp-tax-rounding — memur stamp tax off by 0,01 TL
- **Subject**: memur, stamp-tax, rounding
- **Where**: memur calculation (to be built under `rules/`); evidence in `DL:memur-payslip-reconstruction-2026-11`
- **What**: one-pass 0,759% on the taxable earnings total gives 453,83; the payslip shows 453,84. Twelve different
  two-group roundings reproduce 453,84, so one payslip cannot identify the KBS grouping.
- **Severity**: Low
- **Suggested fix**: collect a second anonymised KBS payslip (different title/amounts) and pick the grouping that
  matches both; until then assert stamp tax within ±0,01 in tests.
- **Why deferred**: needs more evidence, not more code.

## How this file is maintained
1. When you fix one: delete its entry, and reference the stable slug ID in the fixing commit (`closes deferred:<slug>`).
2. When you discover a NEW out-of-scope risk during related work: prompt me (RULES §7), and if I agree, add it here —
   don't let it slip into chat.
3. When something here becomes urgent (impact observed): promote it to a real ticket and link back.
