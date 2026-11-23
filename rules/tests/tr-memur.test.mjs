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
    specialService: 16464.1, supplementary: 16464.1, regional: 0, additional: 25153.05, collectiveBonus: 1113.89,
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
  assert.throws(() => titleRule(titles, "zabit-katibi", 16), /not available/);
  assert.throws(() => calcMemurMonth(period, taxYear, titleRule(titles, "zabit-katibi", 9), person), /not verified/); // 5434 share unknown below d1
  assert.throws(() => calcMemurMonth(period, taxYear, titleRule(titles, "zabit-katibi", 1), { ...person, pensionLaw: "4/b" }), /5434 or 5510/);
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

import { ruleFromPayslip } from "../memur.js";

// The operator's payslip, as printed (KBS line names in comments).
const slip5434 = {
  derece: 1, kademe: 2, serviceYears: 19, month: 11,
  extraIndicator: 4411.43,   // Ek Gösterge
  sidePayment: 649.54,       // Yan Ödeme
  specialService: 16464.1,   // Özel Hizmet Tazminatı
  supplementary: 16464.1,    // Ek Öde.(666 KHK)
  spouse: 0, children: 393.88, collectiveBonus: 1113.89,
  pensionEmployee: 7312.24,  // Emekli Keseneği (Kişi)
  gssEmployee: 0,            // Gen.Sağ.Sig.Pir.(Kişi)
  unionDues: 464.12, taxBase: 25852.43, priorTaxBase: 243795.48,
};

test("payslip mode: derives the same rule from printed amounts and reproduces the payslip", () => {
  const { rule, person, checks } = ruleFromPayslip(period, slip5434);
  assert.deepEqual(checks, []);
  assert.equal(person.pensionLaw, "5434");
  assert.equal(rule.extraIndicator, 2800);
  assert.equal(rule.sidePaymentPoints, 1300);
  assert.equal(rule.specialServiceRate, 1.1);
  assert.equal(rule.supplementaryPaymentRate, 1.1);
  assert.equal(rule.pensionSpecialServiceShare, 0.85);
  const r = calcMemurMonth(period, taxYear, rule, person);
  assert.ok(Math.abs(r.net - 84987.61) <= 0.01, `net ${r.net}`);
  assert.equal(r.lines.children, 393.88);
});

test("payslip mode: a printed amount that does not reconcile is reported, not hidden", () => {
  const { checks } = ruleFromPayslip(period, { ...slip5434, pensionEmployee: 7400 });
  assert.ok(checks.includes("pensionEmployee"));
});

test("5510 contribution base = gösterge + ek g. + taban + kıdem + ÖHT (9% / 5%)", () => {
  // 9/1, 0 years, ÖHT 56%, ek ödeme 85%, 500 yan ödeme points — contributions as published for this profile
  // (MYÖ 3.163,81 / GSS 1.757,67); tax base not verified for 5510 → flagged.
  const { rule, person, checks } = ruleFromPayslip(period, {
    derece: 9, kademe: 1, serviceYears: 0, month: 7, extraIndicator: 0, sidePayment: 249.82,
    specialService: 8381.72, supplementary: 12722.26, spouse: 0, children: 0, collectiveBonus: 0,
    pensionEmployee: 3163.81, gssEmployee: 1757.67, unionDues: 0,
  });
  assert.equal(person.pensionLaw, "5510");
  assert.deepEqual(checks, ["taxBaseUnverified"]);
  const r = calcMemurMonth(period, taxYear, rule, person);
  assert.equal(r.pensionBase, 35153.46);
  assert.equal(r.pensionEmployee, 3163.81);
  assert.equal(r.gssEmployee, 1757.67);
});

test("estimate titles: big-city Adalet memur matches memurlar.net bases; 5434 refused", () => {
  const rule = titleRule(titles, "memur-adalet", 1, "bigCity");
  assert.equal(titles["memur-adalet"].status, "estimate");
  const p5510 = { derece: 1, kademe: 1, serviceYears: 0, pensionLaw: "5510", married: false, unionDues: 0, month: 11, priorTaxBase: 0 };
  const r = calcMemurMonth(period, taxYear, rule, p5510);
  // memurlar.net 1/1 Adalet memur: MYÖ base incl. il adalet 2.245,10 = 42.912,85 → MYÖ 3.862,16 / GSS 2.145,64; GV base 26.528,05
  assert.equal(r.lines.regional, 2245.1);
  assert.equal(r.pensionBase, 42912.85);
  assert.equal(r.pensionEmployee, 3862.16);
  assert.equal(r.gssEmployee, 2145.64);
  assert.equal(r.taxBase, 26528.05);
  assert.equal(r.lines.sidePayment, 249.82);
  assert.throws(() => calcMemurMonth(period, taxYear, rule, { ...p5510, pensionLaw: "5434" }), /not verified/);
});

test("zabıt katibi career table: 12 published nets (İst/Ank/İzm, 5510, BES 3%, no bonus) reproduced", () => {
  // saffetcelik.com.tr "Zabıt Katibi Maaşı 2026" (Jul–Dec 2026, bekâr, first salary of the year).
  const rows = [[9,1,0,70102.15],[8,1,3,70231.44],[7,1,6,71110.15],[6,1,9,71259.58],[5,1,12,71434.88],[4,1,15,76392.43],
    [3,1,18,80072.50],[2,1,21,82458.28],[1,1,24,83527.22],[1,4,27,83785.82],[10,2,0,69830.11],[13,3,0,69752.54]];
  for (const [d, k, y, expected] of rows) {
    const rule = { ...titleRule(titles, "zabit-katibi", d, "bigCity"), collectiveBonusIndicator: 0 };
    const r = calcMemurMonth(period, taxYear, rule, { derece: d, kademe: k, serviceYears: y, pensionLaw: "5510", married: false, unionDues: 0, month: 7, priorTaxBase: 0 });
    const bes = Math.floor(r.pensionBase * 0.03); // BES: 3% of the prime base, whole TL
    const got = Math.round((r.net - bes) * 100) / 100;
    assert.ok(Math.round(Math.abs(got - expected) * 100) <= 1, `${d}/${k}: ${got} vs ${expected}`); // ±0,01: deferred:memur-stamp-tax-rounding
  }
});

test("taşra zabıt katibi d1 = verified payslip rule (ÖHT 100 + 10, no il adalet)", () => {
  const r = titleRule(titles, "zabit-katibi", 1, "other");
  assert.equal(r.specialServiceRate, 1.1);
  assert.equal(r.regionalAllowanceRate, 0);
  assert.equal(r.pensionSpecialServiceShare, 0.85);
  assert.equal(titleRule(titles, "zabit-katibi", 1, "bigCity").pensionSpecialServiceShare, null);
});
