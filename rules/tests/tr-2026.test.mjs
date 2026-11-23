// Known-answer tests for Turkey 2026. Run: node --test rules/tests/*.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calcMonth, calcYear, cumulativeTax } from "../calc.js";

const p = JSON.parse(readFileSync(new URL("../tr/2026.json", import.meta.url)));
const MW = p.minimumWage.monthlyGross;

test("bracket table: cumulative tax at bracket edges matches the 332 tebliğ", () => {
  const b = p.incomeTax.wageBrackets;
  assert.equal(Math.round(cumulativeTax(190000, b) * 100) / 100, 28500);
  assert.equal(Math.round(cumulativeTax(400000, b) * 100) / 100, 70500);
  assert.equal(Math.round(cumulativeTax(1500000, b) * 100) / 100, 367500);
  assert.equal(Math.round(cumulativeTax(5300000, b) * 100) / 100, 1697500);
});

test("minimum wage: net 28.075,50 every month, no income or stamp tax", () => {
  for (const m of calcYear(p, MW).months) {
    assert.equal(m.net, p.minimumWage.monthlyNet, `month ${m.month}`);
    assert.equal(m.incomeTax, 0);
    assert.equal(m.stampTax, 0);
  }
});

test("minimum wage exemption by month matches published amounts", () => {
  const months = calcYear(p, MW * 3).months;
  months.forEach((m, i) =>
    assert.equal(m.incomeTaxExemption, p.minimumWageExemption.checkValues.incomeTaxByMonth[i], `month ${i + 1}`));
  for (const m of months) assert.equal(m.stampTaxExemption, p.minimumWageExemption.checkValues.stampTaxMonthly);
  const total = Math.round(months.reduce((a, m) => a + m.incomeTaxExemption, 0) * 100) / 100;
  assert.equal(total, 57881.23); // published annual total
});

test("minimum wage employer cost without incentive is 40.874,63", () => {
  assert.equal(calcMonth(p, MW, 1).employerCost, 40874.63);
});

test("twice the minimum wage: annual stamp tax 3.008,40, income tax 86.548,01", () => {
  // Hand check: annual tax base 56,151 × 12 = 673,812 → tariff tax 70,500 + 273,812 × 27% = 144,429.24;
  // minus the annual minimum-wage exemption 57,881.23 = 86,548.01. (A 2026 press article gives 91,547,
  // which is consistent with a 52,881 exemption total — 5,000 lower than the published monthly amounts sum to.)
  const y = calcYear(p, MW * 2);
  assert.equal(y.totals.stampTax, 3008.40);
  assert.equal(y.totals.incomeTax, 86548.01);
});

test("SGK base is capped at the 297.270 ceiling", () => {
  const m = calcMonth(p, 400000, 1);
  assert.equal(m.sgkBase, 297270);
  assert.equal(m.sgk, 41617.8);
});

test("rejects gross below the minimum wage and invalid months", () => {
  assert.throws(() => calcMonth(p, MW - 1, 1), RangeError);
  assert.throws(() => calcMonth(p, MW, 13), RangeError);
});
