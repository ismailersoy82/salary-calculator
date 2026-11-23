# SalaryCalc Active State — (2026-11-23)
## Architecture: static bilingual (TR/EN) site; web=HTML/CSS/vanilla JS UI, rules=versioned JSON params (country/year) + pure JS calc; no backend, no ports
## Pipeline: user gross salary → web form → rules/calc.js w/ rules/<country>/<year>.json → net breakdown (income tax, stamp tax, SGK, unemployment)
## DEPLOYED: local only (GitHub Pages planned)
## Current Delta to Published Logic: none — scaffold only, no code yet
## LEARNED FAILURES: none yet
## Open: TR 2026 params + calc; TR/EN UI; GH Pages; TR 2027 params when officially published (Jan 2027); 2nd country (~wk3); field-trial log for Salvor report
## Last Brain Audit: 2026-11-23 (interval 3d — RULES §10.3)
