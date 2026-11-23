# SalaryCalc Active State — (2026-11-23)
## Architecture: static bilingual (TR/EN) site; web=HTML/CSS/vanilla JS UI, rules=versioned JSON params (country/year) + pure JS calc; no backend, no ports
## Pipeline: user gross salary → web form → rules/calc.js w/ rules/<country>/<year>.json → net breakdown (income tax, stamp tax, SGK, unemployment)
## DEPLOYED: NOT YET — Pages (main, /) must be enabled by operator in repo Settings → Pages (proxy blocks the Pages API); target ismailersoy82.github.io/salary-calculator (DEC:publish-repo-root)
## Current Delta to Published Logic: rules/tr/2026.json + rules/calc.js (calcMonth/calcYear, integer kuruş) — 7/7 known-answer tests pass; web/ TR/EN UI done (Playwright 1280/360/320 + dark: 0 overflow, 0 console errors)
## LEARNED FAILURES: LF:float-half-kurus-rounding — float diff of cumulative tax → 4211.32≠4211.33; use integer kuruş (DEC:integer-kurus-arithmetic); assert all 12 months
## MEMUR: rules/memur.js (calcMemurMonth 5434-only, raiseFactor, projectPeriod) + rules/tr/memur/{2026-h2,titles}.json + rules/tr/cpi.json (Jul–Oct) — reproduces real Nov-26 payslip (DV/net ±0,01); only zabıt katibi derece 1 in titles; spouse allowance + 5510 unverified → throw
## Open: MEMUR UI + Jan-2027 scenario inputs; more titles 9/1 GİH, VHKİ, şef, öğretmen, hemşire, polis (operator: official tables acceptable as source, not payslip-only); CPI Nov/Dec when TÜİK publishes; TR 2027 params when officially published (Jan 2027); 2nd country (~wk3); field-trial log for Salvor report
## TR 2026 KEY: MW 33,030 gross/28,075.50 net; SGK 14%+1% (employer 21.75%+2%), base 33,030–297,270; ücret tariff 190k/400k/1.5M/5.3M @15/20/27/35/40%; DV 0.759%; MW exemption GV Jan–Jun 4,211.33·Jul 4,537.75·Aug–Dec 5,615.10, DV 250.70
## Last Brain Audit: 2026-11-23 (interval 3d — RULES §10.3)
