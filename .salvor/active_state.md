# SalaryCalc Active State — (2026-11-23)
## Architecture: static bilingual (TR/EN) site; web=HTML/CSS/vanilla JS UI, rules=versioned JSON params (country/year) + pure JS calc; no backend, no ports
## Pipeline: user gross salary → web form → rules/calc.js w/ rules/<country>/<year>.json → net breakdown (income tax, stamp tax, SGK, unemployment)
## DEPLOYED: GitHub Pages from repo root (main, /) → ismailersoy82.github.io/salary-calculator (DEC:publish-repo-root)
## Current Delta to Published Logic: rules/tr/2026.json + rules/calc.js (calcMonth/calcYear, integer kuruş) — 7/7 known-answer tests pass; web/ TR/EN UI done (Playwright 1280/360/320 + dark: 0 overflow, 0 console errors)
## LEARNED FAILURES: LF:float-half-kurus-rounding — float diff of cumulative tax → 4211.32≠4211.33; use integer kuruş (DEC:integer-kurus-arithmetic); assert all 12 months
## Open: TR 2027 params when officially published (Jan 2027); 2nd country (~wk3); field-trial log for Salvor report
## TR 2026 KEY: MW 33,030 gross/28,075.50 net; SGK 14%+1% (employer 21.75%+2%), base 33,030–297,270; ücret tariff 190k/400k/1.5M/5.3M @15/20/27/35/40%; DV 0.759%; MW exemption GV Jan–Jun 4,211.33·Jul 4,537.75·Aug–Dec 5,615.10, DV 250.70
## Last Brain Audit: 2026-11-23 (interval 3d — RULES §10.3)
