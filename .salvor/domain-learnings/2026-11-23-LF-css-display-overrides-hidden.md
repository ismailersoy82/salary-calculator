- **ID:** LF:css-display-overrides-hidden
- **Subject:** web, css, hidden, ux
- **Claim:** An author `display:` rule (grid/flex) beats the browser's `[hidden] { display: none }`, so elements with the `hidden` attribute stay visible.
- **Evidence date:** 2026-11-23
- **Status:** live
- **Contributed-by:** operator-approved

## Hypothesis
Toggling the `hidden` attribute is enough to show/hide form sections.

## Evidence
Playwright screenshot of the memur page in payslip mode showed both the payslip fields and the preset-title fields
(`.sub { display: grid }`). The same cause had already shipped in commit 2eb8e98: "Eşi çalışıyor" (`.field.check`,
`display: flex`) was visible while "Bekâr" was selected. Text assertions passed in both cases — only the screenshot
revealed it.

## Verdict
Falsified. Root cause: UA stylesheet `[hidden]` has lower precedence than any author `display` rule.

## Fix
`web/style.css`: `[hidden] { display: none !important; }` near the top. Fix site: `web/style.css`. Guard: UI checks must
include a screenshot review (or an `is_hidden` assertion) for every toggled section, not only text values.

## Cross-links
DOMAIN_REF LF registry; L1 LEARNED FAILURES; `DEC:payslip-mode`.
