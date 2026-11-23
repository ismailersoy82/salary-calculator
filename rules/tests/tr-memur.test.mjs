// Civil-servant payroll: known answers from a real, anonymised Nov-2026 KBS payslip
// (DL:memur-payslip-reconstruction-2026-11). Run: node --test rules/tests/*.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calcMemurMonth, titleRule, salaryIndicator, raiseFactor, projectPeriod } from "../memur.js";

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const period = load("../tr/memur/2026-h2.json");
const taxYear = load("../tr/2026.json");
const titles = load("../tr/memur/titles.json");
const cpi = load("../tr/cpi.json");

const person = {
  derece: 1, kademe: 2, serviceYears: 19, pensionLaw: "5434", married: true, spouseWorks: true,
  childrenOver6: 1, childrenUnder6: 0, unionDues: 464.12, month: 11, priorTaxBase: 243795.48,
};
const m = calcMemurMonth(period, taxYear, titleRule(titles, "zabit-katibi", 1), person);

test("payslip earnings lines match to the kuruş", () => {
  assert.deepEqual(m.lines, {
    salary: 2174.21, extraIndicator: 4411.43, base: 25794.92, seniority: 598.69, sidePayment: 649.54,
    specialService: 16464.1, supplementary: 16464.1, additional: 25153.05, collectiveBonus: 1113.89,
    children: 393.88, spouse: 0,
  });
  assert.deepEqual(m.employerLines, { pensionEmployer: 9140.3, gssEmployer: 5484.18 });
  assert.equal(m.grossPayslip, 107842.29);
});

test("5434 pension and income tax match the payslip", () => {
  assert.equal(m.pensionEmployee, 7312.24);
  assert.equal(m.taxBase, 25852.43);
  assert.equal(m.incomeTaxGross, 5170.49);
  assert.equal(m.incomeTaxExemption, 5170.49); // capped at the tax computed
  assert.equal(m.incomeTax, 0);
});

test("stamp tax and net within 0,01 of the payslip (deferred:memur-stamp-tax-rounding)", () => {
  assert.ok(Math.abs(m.stampTax - 453.84) <= 0.01, `stamp ${m.stampTax}`);
  assert.ok(Math.abs(m.net - 84987.61) <= 0.01, `net ${m.net}`);
});

test("gösterge table and unverified inputs are guarded", () => {
  assert.equal(salaryIndicator(period, 9, 1), 620);
  assert.equal(salaryIndicator(period, 1, 4), 1500);
  assert.throws(() => salaryIndicator(period, 1, 5), RangeError);
  assert.throws(() => titleRule(titles, "zabit-katibi", 9), /not verified/);
  assert.throws(() => calcMemurMonth(period, taxYear, titleRule(titles, "zabit-katibi", 1), { ...person, pensionLaw: "5510" }), /5434/);
  assert.throws(() => calcMemurMonth(period, taxYear, titleRule(titles, "zabit-katibi", 1), { ...person, spouseWorks: false }), /spouse allowance/);
});

test("raise factor: Jul–Oct 2026 CPI gives the published 8,28% and 1,20% catch-up", () => {
  const months = ["2026-07", "2026-08", "2026-09", "2026-10"].map((k) => cpi.monthly[k].pct);
  const r = raiseFactor(months, 0.07, 0.05);
  assert.equal(Math.round(r.cumulativeInflation * 10000) / 100, 8.28);
  assert.equal(Math.round(r.catchUp * 10000) / 100, 1.2);
  assert.equal(raiseFactor([0.5, 0.5], 0.07, 0.05).factor, 1.05); // no catch-up below the agreed rate
});

test("projection scales coefficients and leaves the original untouched", () => {
  const p2 = projectPeriod(period, 1.079, "2027-H1 (projection)");
  assert.equal(p2.coefficients.monthly, Math.round(1.575512 * 1.079 * 1e6) / 1e6);
  assert.equal(period.coefficients.monthly, 1.575512);
  assert.equal(p2.projected, true);
});
