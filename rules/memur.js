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

/** Title parameters for a derece, or an error if not verified yet. */
export function titleRule(titles, titleId, derece) {
  const t = titles[titleId];
  if (!t) throw new RangeError(`unknown title ${titleId}`);
  const r = t.byDerece[String(derece)];
  if (!r) throw new RangeError(`${titleId}: derece ${derece} not verified yet`);
  return r;
}

/**
 * One month's payroll.
 * @param {object} period  rules/tr/memur/<period>.json (coefficients may be pre-scaled by projectPeriod)
 * @param {object} taxYear rules/tr/<year>.json (tariff, minimum wage exemption)
 * @param {object} rule    title rule for the person's derece (titleRule)
 * @param {object} p       person: { derece, kademe, serviceYears, pensionLaw: "5434", married, spouseWorks, childrenOver6,
 *                         childrenUnder6, unionDues (TL), month (1–12), priorTaxBase (TL, cumulative before this month) }
 */
export function calcMemurMonth(period, taxYear, rule, p) {
  if (p.pensionLaw !== "5434") throw new RangeError("only 5434 (entered before 01.10.2008) is verified so far");
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
  lines.additional = mulCoef(ind.additionalPayment, K);
  lines.collectiveBonus = mulCoef(ind.collectiveBonus, K);
  lines.children = mulCoef(ind.childOver6, K) * (p.childrenOver6 || 0) + mulCoef(ind.childUnder6, K) * (p.childrenUnder6 || 0);
  if (p.married && !p.spouseWorks) {
    if (ind.spouseAllowance == null) throw new RangeError("spouse allowance not verified yet");
    lines.spouse = mulCoef(ind.spouseAllowance, K);
  } else lines.spouse = 0;

  // 5434 pension contributions
  const pen = period.pension5434;
  const pensionBase = lines.salary + lines.extraIndicator + lines.seniority + lines.base + mulRate(edma, rule.pensionSpecialServiceShare);
  const pensionEmployee = mulRate(pensionBase, pen.employeeRate);
  const pensionEmployer = mulRate(pensionBase, pen.employerRate);
  const gssEmployer = mulRate(pensionBase, pen.employerGssRate);
  const unionDues = toKurus(p.unionDues || 0);

  // Income tax: base excludes ÖHT, ek ödeme, ilave ödeme, family/child, bonus.
  const taxBase = lines.salary + lines.extraIndicator + lines.base + lines.seniority + lines.sidePayment - pensionEmployee - unionDues;
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
  const net = earnings - pensionEmployee - incomeTax - stampTax - unionDues;

  const tl = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, fromKurus(v)]));
  return {
    lines: tl(lines),
    employerLines: tl({ pensionEmployer, gssEmployer }),
    grossPayslip: fromKurus(earnings + pensionEmployer + gssEmployer), // "Gelir Toplamı" on KBS payslips
    pensionBase: fromKurus(pensionBase),
    pensionEmployee: fromKurus(pensionEmployee),
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
