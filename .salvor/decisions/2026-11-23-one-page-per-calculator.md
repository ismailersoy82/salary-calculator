- **ID:** DEC:one-page-per-calculator
- **Subject:** web, navigation, memur, ux
- **Claim:** Each calculator type is its own page under `web/`, linked by a shared tab bar; pages share `style.css`, `i18n.js` and `rules/`, and forms are never merged.
- **Evidence date:** 2026-11-23
- **Status:** live
- **Contributed-by:** operator-approved

## Context
The civil-servant calculator needs ~12 inputs (title, derece/kademe, service years, pension law, family, union dues,
prior taxable base, CPI scenario); the private-sector one needs two. The operator asked whether they should be separate.

## Decision
`web/index.html` = private sector, `web/memur.html` = civil servant. Both render the same `<nav class="tabs top-nav">`
with `aria-current="page"` on the active tab. A future calculator type (e.g. a second country) becomes another page and
another tab.

## Rationale
Distinct input sets stay readable on a phone; each page has a shareable URL; shared CSS, strings and `rules/` keep tax
logic in one place (a 2027 tariff update reaches both pages at once).

## Invariant
Do not merge calculators into one form with mode switches. Every page must include the tab bar and import tax logic
from `rules/` (never duplicate it in `web/`). Narrow-screen table rules must be scoped to a page's own table IDs
(a global `td:nth-child(2)` rule hid a column on the memur page — fixed by scoping to `#year`).

## Coupling / blast radius
`web/index.html`, `web/memur.html`, `web/app.js`, `web/memur.js`, `web/i18n.js` (`navPrivate`, `navMemur`, `m.*`),
`web/style.css` (`.tabs`, `.top-nav`, page-scoped table rules).

## Alternatives rejected
- Single page with a sector toggle — crowded on phones, one URL for two audiences.
