// Pure civil-servant (657 s.K. memur) payroll calculation and raise projection.
// Verified against one real KBS payslip: DL:memur-payslip-reconstruction-2026-11.
// Money in integer kuruş (DEC:integer-kurus-arithmetic). Coefficients have 6 decimals.

import { incrementalTax, toKurus, fromKurus, mulRate } from "./calc.js";

/** indicator (integer points) × coefficient (≤ 6 decimals) → kuruş, half-up. */
const mulCoef = (indicator, coef) => Math.round((indicator * Math.round(coef * 1e6)) / 1e4);

/** Indicator for derece/kademe from the 657 md. 43/A table. */
export function salaryIndicator(period, derece, kademe) {
  const row = period.salaryScale[String(derece)];
  if (!row) throw new RangeError(`derece must be 1–15`);
  const v = row[kademe - 1];
  if (!v) throw new RangeError(`derece ${derece} has kademe 1–${row.length}`);
  return v;
}

/**
 * Title parameters for a derece (and duty location, if the title has location variants).
 * location: "bigCity" (İstanbul/Ankara/İzmir) | "other".
 */
export function titleRule(titles, titleId, derece, location = "other") {
  const t = titles[titleId];
  if (!t) throw new RangeError(`unknown title ${titleId}`);
  const r = t.byDerece[String(derece)];
  if (!r) throw new RangeError(`${titleId}: derece ${derece} not available`);
  const loc = t.locations?.[location];
  if (t.locations && !loc) throw new RangeError(`${titleId}: unknown location ${location}`);
  if (!loc) return r;
  const rule = {
    ...r,
    specialServiceRate: Math.round((r.specialServiceRate + loc.specialServiceAdd) * 100) / 100,
    regionalAllowanceRate: loc.regionalAllowanceRate,
  };
  // The verified 5434 pension share belongs to the verified location only.
  if (r.status === "verified-other" && location !== "other") { rule.status = "estimate"; rule.pensionSpecialServiceShare = null; }
  return rule;
}

/**
 * One month's payroll.
 * @param {object} period  rules/tr/memur/<period>.json (coefficients may be pre-scaled by projectPeriod)
 * @param {object} taxYear rules/tr/<year>.json (tariff, minimum wage exemption)
 * @param {object} rule    title rule for the person's derece (titleRule)
 * @param {object} p       person: { derece, kademe, serviceYears, pensionLaw: "5434" | "5510", married, spouseWorks,
 *                         childrenOver6, childrenUnder6, unionDues (TL), month (1–12), priorTaxBase (TL, cumulative before) }
 * A rule built by ruleFromPayslip may also carry indicator overrides: spouseIndicator, childIndicator,
 * collectiveBonusIndicator, and taxDeductsGss (5510: whether the employee GSS share is deducted from the tax base).
 */
export function calcMemurMonth(period, taxYear, rule, p) {
  if (p.pensionLaw !== "5434" && p.pensionLaw !== "5510") throw new RangeError("pension law must be 5434 or 5510");
  if (p.pensionLaw === "5510" && !period.pension5510) throw new RangeError("5510 rates missing for this period");
  const c = period.coefficients, ind = period.indicators;
  const K = c.monthly;

  const lines = {}; // kuruş
  lines.salary = mulCoef(salaryIndicator(period, p.derece, p.kademe), K);
  lines.extraIndicator = mulCoef(rule.extraIndicator, K);
  lines.base = mulCoef(ind.baseSalary, c.base);
  lines.seniority = mulCoef(ind.seniorityPerYear * Math.min(p.serviceYears, ind.seniorityMaxYears), K);
  lines.sidePayment = mulCoef(rule.sidePaymentPoints, c.sidePayment);
  const edma = mulCoef(ind.highestCivilServantSalary, K);
  lines.specialService = mulRate(edma, rule.specialServiceRate);
  lines.supplementary = mulRate(edma, rule.supplementaryPaymentRate);
  lines.regional = mulRate(edma, rule.regionalAllowanceRate || 0); // e.g. İl Adalet Hizmetleri Tazminatı
  lines.additional = mulCoef(ind.additionalPayment, K);
  lines.collectiveBonus = mulCoef(rule.collectiveBonusIndicator ?? ind.collectiveBonus, K);
  lines.children = rule.childIndicator != null
    ? mulCoef(rule.childIndicator, K)
    : mulCoef(ind.childOver6, K) * (p.childrenOver6 || 0) + mulCoef(ind.childUnder6, K) * (p.childrenUnder6 || 0);
  if (rule.spouseIndicator != null) {
    lines.spouse = mulCoef(rule.spouseIndicator, K);
  } else if (p.married && !p.spouseWorks) {
    if (ind.spouseAllowance == null) throw new RangeError("spouse allowance not verified yet");
    lines.spouse = mulCoef(ind.spouseAllowance, K);
  } else lines.spouse = 0;

  // Pension contributions.
  // 5434: base = gösterge + ek g. + kıdem + taban + title share × EDMA; employee 16%, employer 20% + GSS 12%.
  // 5510 (4/c, md. 80–81): base = gösterge + ek g. + taban + kıdem + ÖHT; employee MYÖ 9% + GSS 5%.
  let pensionBase, pensionEmployee, gssEmployee = 0, pensionEmployer = 0, gssEmployer = 0;
  if (p.pensionLaw === "5434") {
    if (rule.pensionSpecialServiceShare == null) throw new RangeError("5434 pension base share not verified for this title");
    if (lines.regional) throw new RangeError("5434 pension base share not verified for this title (regional allowance)");
    const pen = period.pension5434;
    pensionBase = lines.salary + lines.extraIndicator + lines.seniority + lines.base + mulRate(edma, rule.pensionSpecialServiceShare);
    pensionEmployee = mulRate(pensionBase, pen.employeeRate);
    pensionEmployer = mulRate(pensionBase, pen.employerRate);
    gssEmployer = mulRate(pensionBase, pen.employerGssRate);
  } else {
    const pen = period.pension5510;
    pensionBase = lines.salary + lines.extraIndicator + lines.base + lines.seniority + lines.specialService + lines.regional;
    pensionEmployee = mulRate(pensionBase, pen.employeeRate);
    gssEmployee = mulRate(pensionBase, pen.employeeGssRate);
    if (pen.employerRate != null) pensionEmployer = mulRate(pensionBase, pen.employerRate);
    if (pen.employerGssRate != null) gssEmployer = mulRate(pensionBase, pen.employerGssRate);
  }
  const unionDues = toKurus(p.unionDues || 0);

  // Income tax: base excludes ÖHT, ek ödeme, ilave ödeme, family/child, bonus.
  const taxDeductsGss = rule.taxDeductsGss ?? true;
  const taxBase = lines.salary + lines.extraIndicator + lines.base + lines.seniority + lines.sidePayment
    - pensionEmployee - (taxDeductsGss ? gssEmployee : 0) - unionDues;
  const brackets = taxYear.incomeTax.wageBrackets;
  const incomeTaxGross = toKurus(incrementalTax(p.priorTaxBase || 0, fromKurus(taxBase), brackets));
  const mw = toKurus(taxYear.minimumWage.monthlyGross), ss = taxYear.socialSecurity;
  const mwTaxBase = mw - mulRate(mw, ss.employeeSgkRate) - mulRate(mw, ss.employeeUnemploymentRate);
  const mwExemption = toKurus(incrementalTax(fromKurus(mwTaxBase) * (p.month - 1), fromKurus(mwTaxBase), brackets));
  const incomeTaxExemption = Math.min(incomeTaxGross, mwExemption);
  const incomeTax = incomeTaxGross - incomeTaxExemption;

  // Stamp tax: on earnings except child/family allowance (devlet pension lines are not in `lines`).
  // Known ±0,01 vs KBS — deferred:memur-stamp-tax-rounding.
  const stampBase = Object.entries(lines).filter(([k]) => k !== "children" && k !== "spouse").reduce((a, [, v]) => a + v, 0);
  const stampTaxGross = mulRate(stampBase, period.stampTaxRate);
  const stampTaxExemption = Math.min(stampTaxGross, mulRate(mw, period.stampTaxRate));
  const stampTax = stampTaxGross - stampTaxExemption;

  const earnings = Object.values(lines).reduce((a, b) => a + b, 0);
  const net = earnings - pensionEmployee - gssEmployee - incomeTax - stampTax - unionDues;

  const tl = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, fromKurus(v)]));
  return {
    lines: tl(lines),
    employerLines: tl({ pensionEmployer, gssEmployer }),
    grossPayslip: fromKurus(earnings + pensionEmployer + gssEmployer), // "Gelir Toplamı" on KBS payslips
    pensionBase: fromKurus(pensionBase),
    pensionLaw: p.pensionLaw,
    pensionEmployee: fromKurus(pensionEmployee),
    gssEmployee: fromKurus(gssEmployee),
    unionDues: fromKurus(unionDues),
    taxBase: fromKurus(taxBase),
    cumulativeTaxBase: fromKurus(toKurus(p.priorTaxBase || 0) + taxBase),
    incomeTaxGross: fromKurus(incomeTaxGross),
    incomeTaxExemption: fromKurus(incomeTaxExemption),
    incomeTax: fromKurus(incomeTax),
    stampTaxGross: fromKurus(stampTaxGross),
    stampTaxExemption: fromKurus(stampTaxExemption),
    stampTax: fromKurus(stampTax),
    net: fromKurus(net),
  };
}

/**
 * Raise factor under the 8th-term collective agreement: new agreed rate × inflation catch-up for the previous half.
 * @param {number[]} monthlyPct  CPI monthly % for the six months of the previous half (scenario values allowed)
 * @param {number} prevAgreedRate  agreed raise applied at the start of that half (e.g. 0.07)
 * @param {number} newAgreedRate   agreed raise for the new half (e.g. 0.05)
 */
export function raiseFactor(monthlyPct, prevAgreedRate, newAgreedRate) {
  const cum = monthlyPct.reduce((a, m) => a * (1 + m / 100), 1);
  const catchUp = Math.max(1, cum / (1 + prevAgreedRate));
  return { cumulativeInflation: cum - 1, catchUp: catchUp - 1, factor: (1 + newAgreedRate) * catchUp };
}

/** Copy of a period with all three coefficients multiplied by `factor` (6-decimal rounding, as published). */
export function projectPeriod(period, factor, label) {
  const r6 = (x) => Math.round(x * 1e6) / 1e6;
  const c = period.coefficients;
  return {
    ...period,
    period: label,
    projected: true,
    coefficients: { ...c, monthly: r6(c.monthly * factor), base: r6(c.base * factor), sidePayment: r6(c.sidePayment * factor), source: `projection ×${factor.toFixed(6)} from ${period.period}` },
  };
}

/**
 * Build a rule + person from the amounts printed on one KBS payslip, so any title/institution can be projected.
 * The payslip must belong to `period` (same coefficients). Amounts are TL as printed.
 * @param {object} slip { derece, kademe, serviceYears, month, extraIndicator, sidePayment, specialService, supplementary,
 *   spouse, children, collectiveBonus, pensionEmployee, gssEmployee, unionDues, taxBase?, priorTaxBase? }
 * @returns {{ rule, person, checks: string[] }}  checks lists derivations that did not reconcile with the payslip.
 */
export function ruleFromPayslip(period, slip) {
  const c = period.coefficients, ind = period.indicators, K = c.monthly;
  const edma = fromKurus(mulCoef(ind.highestCivilServantSalary, K));
  const pts = (tl, coef) => Math.round(tl / coef);
  const rate = (tl) => Math.round((tl / edma) * 100) / 100; // tariff rates are whole percents
  const pensionLaw = (slip.gssEmployee || 0) > 0 ? "5510" : "5434";
  const rule = {
    extraIndicator: pts(slip.extraIndicator || 0, K),
    sidePaymentPoints: pts(slip.sidePayment || 0, c.sidePayment),
    specialServiceRate: rate(slip.specialService || 0),
    supplementaryPaymentRate: rate(slip.supplementary || 0),
    spouseIndicator: pts(slip.spouse || 0, K),
    childIndicator: pts(slip.children || 0, K),
    collectiveBonusIndicator: pts(slip.collectiveBonus || 0, K),
    source: "payslip",
  };
  const person = {
    derece: slip.derece, kademe: slip.kademe, serviceYears: slip.serviceYears, pensionLaw,
    unionDues: slip.unionDues || 0, month: slip.month, priorTaxBase: slip.priorTaxBase || 0,
  };
  const checks = [];
  if (pensionLaw === "5434") {
    // Back out the title share × EDMA that enters the 5434 base.
    const known = fromKurus(mulCoef(salaryIndicator(period, slip.derece, slip.kademe), K) + mulCoef(rule.extraIndicator, K)
      + mulCoef(ind.seniorityPerYear * Math.min(slip.serviceYears, ind.seniorityMaxYears), K) + mulCoef(ind.baseSalary, c.base));
    rule.pensionSpecialServiceShare = Math.round(((slip.pensionEmployee / period.pension5434.employeeRate - known) / edma) * 100) / 100;
  }
  // Reconcile: recompute and compare with what the payslip printed.
  const m = calcMemurMonth(period, { ...TAX_PLACEHOLDER }, rule, person, true);
  if (Math.abs(m.pensionEmployee - (slip.pensionEmployee || 0)) > 0.01) checks.push("pensionEmployee");
  if (pensionLaw === "5510" && Math.abs(m.gssEmployee - slip.gssEmployee) > 0.01) checks.push("gssEmployee");
  if (slip.taxBase != null) {
    if (Math.abs(m.taxBase - slip.taxBase) > 0.01) {
      // 5510: try the other GSS treatment before giving up.
      const alt = calcMemurMonth(period, { ...TAX_PLACEHOLDER }, { ...rule, taxDeductsGss: !(rule.taxDeductsGss ?? true) }, person, true);
      if (pensionLaw === "5510" && Math.abs(alt.taxBase - slip.taxBase) <= 0.01) rule.taxDeductsGss = !(rule.taxDeductsGss ?? true);
      else checks.push("taxBase");
    }
  } else if (pensionLaw === "5510") checks.push("taxBaseUnverified");
  return { rule, person, checks };
}

// Tax figures are irrelevant to the reconciliation above (only bases and contributions are compared).
const TAX_PLACEHOLDER = {
  incomeTax: { wageBrackets: [{ upTo: null, rate: 0 }] },
  minimumWage: { monthlyGross: 0 },
  socialSecurity: { employeeSgkRate: 0, employeeUnemploymentRate: 0 },
};
