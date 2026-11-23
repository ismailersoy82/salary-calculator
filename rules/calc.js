// Pure gross→net payroll calculation. No I/O, no hidden state.
// All statutory numbers come from the parameter file passed in (e.g. rules/tr/2026.json).

const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

// Money is handled in integer kuruş and rates as integers per 100,000 so that
// half-kuruş results (e.g. 28,075.50 × 15% = 4,211.325) round the same way payroll does.
const toKurus = (tl) => Math.round(tl * 100);
const rateInt = (r) => Math.round(r * 100000);
const mulRate = (kurus, r) => Math.round((kurus * rateInt(r)) / 100000); // → kuruş
const fromKurus = (k) => k / 100;

/** Income tax due on `base` added on top of `cumBefore` (both TL), rounded to the kuruş. */
export function incrementalTax(cumBefore, base, brackets) {
  const start = toKurus(cumBefore);
  const end = start + toKurus(base);
  let lower = 0;
  let exact = 0; // kuruş × 100,000
  for (const { upTo, rate } of brackets) {
    const upper = upTo == null ? Infinity : toKurus(upTo);
    const lo = Math.max(start, lower);
    const hi = Math.min(end, upper);
    if (hi > lo) exact += (hi - lo) * rateInt(rate);
    lower = upper;
    if (lower >= end) break;
  }
  return fromKurus(Math.round(exact / 100000));
}

/** Cumulative income tax on a cumulative taxable base, using a progressive bracket table. */
export function cumulativeTax(base, brackets) {
  let tax = 0;
  let lower = 0;
  for (const { upTo, rate } of brackets) {
    const upper = upTo ?? Infinity;
    if (base <= lower) break;
    tax += (Math.min(base, upper) - lower) * rate;
    lower = upper;
  }
  return tax;
}

/**
 * One month's payroll for an employee paid the same gross every month since January
 * with a single employer.
 * @param {object} p  parameter file contents
 * @param {number} gross  monthly gross salary
 * @param {number} month  1–12
 */
export function calcMonth(p, gross, month) {
  if (!(month >= 1 && month <= 12)) throw new RangeError("month must be 1–12");
  if (!(gross >= p.minimumWage.monthlyGross)) throw new RangeError("gross must be at least the gross minimum wage");

  const ss = p.socialSecurity;
  const sgkBase = Math.min(Math.max(gross, ss.baseFloorMonthly), ss.baseCeilingMonthly);
  const sgk = fromKurus(mulRate(toKurus(sgkBase), ss.employeeSgkRate));
  const unemployment = fromKurus(mulRate(toKurus(sgkBase), ss.employeeUnemploymentRate));

  const brackets = p.incomeTax.wageBrackets;
  const taxBase = round2(gross - sgk - unemployment);
  const cumBefore = taxBase * (month - 1);
  const incomeTaxGross = incrementalTax(cumBefore, taxBase, brackets);

  // Minimum-wage exemption: the tax a minimum-wage earner would owe this month.
  const mw = p.minimumWage.monthlyGross;
  const mwKurus = toKurus(mw);
  const mwTaxBase = fromKurus(mwKurus - mulRate(mwKurus, ss.employeeSgkRate) - mulRate(mwKurus, ss.employeeUnemploymentRate));
  const incomeTaxExemption = Math.min(incomeTaxGross, incrementalTax(mwTaxBase * (month - 1), mwTaxBase, brackets));
  const incomeTax = round2(incomeTaxGross - incomeTaxExemption);

  const stampTaxGross = fromKurus(mulRate(toKurus(gross), p.stampTax.rate));
  const stampTaxExemption = Math.min(stampTaxGross, fromKurus(mulRate(mwKurus, p.stampTax.rate)));
  const stampTax = round2(stampTaxGross - stampTaxExemption);

  const net = round2(gross - sgk - unemployment - incomeTax - stampTax);
  const employerCost = fromKurus(toKurus(gross) + mulRate(toKurus(sgkBase), ss.employerSgkRate + ss.employerUnemploymentRate));

  return {
    month, gross, sgkBase, sgk, unemployment, taxBase,
    cumulativeTaxBase: round2(cumBefore + taxBase),
    incomeTaxGross, incomeTaxExemption, incomeTax,
    stampTaxGross, stampTaxExemption, stampTax,
    net, employerCost,
  };
}

/** Twelve months for a constant monthly gross, plus annual totals. */
export function calcYear(p, gross) {
  const months = Array.from({ length: 12 }, (_, i) => calcMonth(p, gross, i + 1));
  const sum = (k) => round2(months.reduce((a, m) => a + m[k], 0));
  return {
    months,
    totals: {
      gross: sum("gross"), sgk: sum("sgk"), unemployment: sum("unemployment"),
      incomeTax: sum("incomeTax"), stampTax: sum("stampTax"),
      net: sum("net"), employerCost: sum("employerCost"),
    },
  };
}
