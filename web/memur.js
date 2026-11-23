import { calcMemurMonth, titleRule, raiseFactor, projectPeriod, ruleFromPayslip } from "../rules/memur.js";
import { STRINGS, fill } from "./i18n.js";

const $ = (id) => document.getElementById(id);
const url = (p) => new URL(p, import.meta.url);
const CURRENT_MONTH = 11; // Kasım 2026 — latest payslip month in the verified period

let D = {};
let lang = (() => {
  try { return localStorage.getItem("lang") || (navigator.language?.startsWith("tr") ? "tr" : "en"); } catch { return "tr"; }
})();
if (!STRINGS[lang]) lang = "tr";
const t = () => STRINGS[lang];
const m = () => STRINGS[lang].m;
const money = (x) => new Intl.NumberFormat(t().locale, { style: "currency", currency: "TRY" }).format(x);
const pct = (x, d = 2) => new Intl.NumberFormat(t().locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(x * 100);
const num = (s) => {
  const v = String(s ?? "").trim().replace(/\s|₺|TL/gi, "");
  if (!v) return NaN;
  const n = v.includes(",") ? v.replace(/\./g, "").replace(",", ".") : v;
  return /^-?\d+(\.\d+)?$/.test(n) ? Number(n) : NaN;
};

function fillSelect(sel, items, keep) {
  const cur = keep ?? sel.value;
  sel.innerHTML = items.map(([v, label]) => `<option value="${v}">${label}</option>`).join("");
  if (items.some(([v]) => String(v) === String(cur))) sel.value = cur;
}

function populate() {
  fillSelect($("title"), Object.entries(D.titles).map(([id, tt]) => [id, tt.name[lang] + (tt.status === "estimate" ? ` (${m().estimated})` : "")]));
  const tt = D.titles[$("title").value];
  fillSelect($("derece"), Object.keys(tt.byDerece).map((d) => [d, d]), $("derece").value || 1);
  $("locField").hidden = !tt.locations;
  const row = D.period.salaryScale[$("derece").value];
  fillSelect($("kademe"), row.map((g, i) => [i + 1, `${i + 1} (${g})`]), $("kademe").value || 2);
}

const mode = () => document.querySelector('input[name="mode"]:checked').value;
const SLIP_KEYS = ["extraIndicator", "sidePayment", "specialService", "supplementary", "spouse", "children", "collectiveBonus", "unionDues", "pensionEmployee", "gssEmployee", "taxBase", "priorTaxBase"];

function populateSlip() {
  const months = t().months;
  fillSelect($("sMonth"), [7, 8, 9, 10, 11, 12].map((n) => [n, `${months[n - 1]} 2026`]), $("sMonth").value || CURRENT_MONTH);
  fillSelect($("sDerece"), Object.keys(D.period.salaryScale).filter((k) => /^\d+$/.test(k)).map((d) => [d, d]), $("sDerece").value || 9);
  const row = D.period.salaryScale[$("sDerece").value];
  fillSelect($("sKademe"), row.map((g, i) => [i + 1, `${i + 1} (${g})`]), $("sKademe").value || 1);
}

function applyMode() {
  const slip = mode() === "slip";
  $("slipFields").hidden = !slip;
  $("readyFields").hidden = slip;
}

function applyStrings() {
  const s = t(), ms = m();
  document.documentElement.lang = lang;
  document.title = ms.title;
  $("h1").textContent = ms.title;
  $("subtitle").textContent = fill(ms.subtitle, { period: D.period.period });
  $("lang").textContent = s.langSwitch;
  $("navPrivate").textContent = s.navPrivate;
  $("navMemur").textContent = s.navMemur;
  $("sourcesLabel").textContent = s.sources;
  document.querySelectorAll("[data-m]").forEach((el) => { el.textContent = ms[el.dataset.m]; });
  const known = Object.values(D.cpi.monthly).map((x) => x.pct);
  $("cpiKnown").textContent = fill(ms.cpiKnown, { cum: pct(raiseFactor(known, 0, 0).cumulativeInflation) });
  $("sources").innerHTML = "";
  for (const line of [...Object.values(D.titles).map((tt) => `${tt.name[lang]}: ${tt.source}`), D.period.coefficients.source, D.period.salaryScale.source, D.taxYear.incomeTax.source, D.cpi.series + " — " + Object.values(D.cpi.monthly).map((x) => x.source).join("; ")]) {
    const li = document.createElement("li"); li.textContent = line; $("sources").append(li);
  }
  populate();
  populateSlip();
}

function readPerson() {
  const married = $("married").value === "1";
  return {
    derece: Number($("derece").value), kademe: Number($("kademe").value),
    serviceYears: Math.max(0, Math.floor(Number($("years").value) || 0)),
    pensionLaw: $("law").value, married, spouseWorks: married ? $("spouseWorks").checked : false,
    childrenOver6: Math.max(0, Number($("childOver6").value) || 0),
    childrenUnder6: Math.max(0, Number($("childUnder6").value) || 0),
    unionDues: Math.max(0, num($("union").value) || 0),
  };
}

function render() {
  const ms = m();
  $("error").hidden = true;
  $("warn").hidden = true;
  try {
    let person, rule, priorInput, month = CURRENT_MONTH;
    const warnings = [];
    if (mode() === "slip") {
      const slip = { derece: Number($("sDerece").value), kademe: Number($("sKademe").value),
        serviceYears: Math.max(0, Math.floor(Number($("sYears").value) || 0)), month: Number($("sMonth").value) };
      for (const k of SLIP_KEYS) { const v = num($("s_" + k).value); slip[k] = Number.isFinite(v) ? v : (k === "taxBase" || k === "priorTaxBase" ? undefined : 0); }
      if (!slip.pensionEmployee) { $("out").hidden = true; return; }
      const built = ruleFromPayslip(D.period, slip);
      rule = built.rule; person = built.person; month = slip.month;
      priorInput = Number.isFinite(slip.priorTaxBase) ? slip.priorTaxBase : NaN;
      warnings.push(...built.checks);
    } else {
      person = readPerson();
      rule = titleRule(D.titles, $("title").value, person.derece, $("loc").value);
      priorInput = num($("prior").value);
      if (person.pensionLaw === "5510") warnings.push("taxBaseUnverified");
      if (rule.status !== "verified-other" || $("loc").value !== "other") warnings.push("presetEstimate");
    }

    // Current month: if the payslip's prior cumulative base is not given, estimate it (Jan–Jun at the H1 coefficient ratio).
    const probe = calcMemurMonth(D.period, D.taxYear, rule, { ...person, month, priorTaxBase: 0 });
    const h1Ratio = D.period.previousPeriod.monthly / D.period.coefficients.monthly;
    const priorEst = Math.round((probe.taxBase * 6 * h1Ratio + probe.taxBase * (month - 7)) * 100) / 100;
    const prior = Number.isFinite(priorInput) ? priorInput : priorEst;
    const now = calcMemurMonth(D.period, D.taxYear, rule, { ...person, month, priorTaxBase: prior });

    // January 2027: Jul–Dec CPI (official + scenario), new period, tax year restarts.
    const months = [...Object.values(D.cpi.monthly).map((x) => x.pct), Number($("cpiNov").value) || 0, Number($("cpiDec").value) || 0];
    const r = raiseFactor(months.slice(0, 6), 0.07, 0.05);
    const p27 = projectPeriod(D.period, r.factor, "2027-H1 (tahmin)");
    p27.indicators = D.period.indicators;
    const jan = calcMemurMonth(p27, D.taxYear, rule, { ...person, month: 1, priorTaxBase: 0 });

    $("nowTitle").textContent = fill(ms.nowTitle, { month: t().months[month - 1] }) + (Number.isFinite(priorInput) ? "" : ` (${ms.estimated})`);
    $("nowNet").textContent = money(now.net);
    $("janTitle").textContent = ms.janTitle;
    $("janNet").textContent = money(jan.net);
    const diff = jan.net - now.net;
    $("janDelta").textContent = `${diff >= 0 ? "+" : "−"}${money(Math.abs(diff))} (${diff >= 0 ? "+" : "−"}%${pct(Math.abs(diff / now.net))})`;

    $("raise").innerHTML = [
      [ms.sixMonth, "%" + pct(r.cumulativeInflation)],
      [ms.catchUp, "%" + pct(r.catchUp)],
      [ms.raise, "%" + pct(r.factor - 1)],
    ].map(([a, b], i) => `<div class="row${i === 2 ? " total" : ""}"><dt>${a}</dt><dd>${b}</dd></div>`).join("");

    $("colNow").textContent = `${t().months[month - 1].slice(0, 3)} 2026`;
    $("colJan").textContent = `${t().months[0].slice(0, 3)} 2027`;
    const keys = ["salary", "extraIndicator", "base", "seniority", "sidePayment", "specialService", "supplementary", "regional", "additional", "collectiveBonus", "children", "spouse"];
    const rows = keys.filter((k) => now.lines[k] || jan.lines[k]).map((k) => [ms[k], now.lines[k], jan.lines[k], ""]);
    const sum = (o) => Object.values(o.lines).reduce((a, b) => a + b, 0);
    rows.push([ms.earnings, sum(now), sum(jan), "total"]);
    rows.push([ms.pension.replace("16", now.pensionLaw === "5510" ? "9" : "16"), -now.pensionEmployee, -jan.pensionEmployee, ""]);
    if (now.gssEmployee) rows.push([ms.k_gssEmployee, -now.gssEmployee, -jan.gssEmployee, ""]);
    if (now.unionDues) rows.push([ms.unionDues, -now.unionDues, -jan.unionDues, ""]);
    rows.push([ms.incomeTax, -now.incomeTax, -jan.incomeTax, ""]);
    rows.push([ms.stampTax, -now.stampTax, -jan.stampTax, ""]);
    rows.push([ms.net, now.net, jan.net, "total"]);
    $("lines").innerHTML = rows.map(([label, a, b, cls]) =>
      `<tr class="${cls}"><td>${label}</td><td class="num">${money(a)}</td><td class="num">${money(b)}</td></tr>`).join("");
    $("out").hidden = false;
    if (warnings.length) { $("warn").textContent = warnings.map((w) => ms["w_" + w]).join(" "); $("warn").hidden = false; }
  } catch (e) {
    $("out").hidden = true;
    $("error").textContent = /spouse/.test(e.message) ? ms.errSpouse
      : /5434 pension/.test(e.message) ? ms.err5434 : fill(ms.errGeneric, { msg: e.message });
    $("error").hidden = false;
  }
}

async function init() {
  const get = async (p) => (await fetch(url(p))).json();
  const [period, titles, taxYear, cpi] = await Promise.all([
    get("../rules/tr/memur/2026-h2.json"), get("../rules/tr/memur/titles.json"), get("../rules/tr/2026.json"), get("../rules/tr/cpi.json"),
  ]);
  D = { period, titles, taxYear, cpi };
  applyStrings();
  const toggleSpouse = () => { $("spouseField").hidden = $("married").value !== "1"; };
  $("married").addEventListener("change", () => { toggleSpouse(); render(); });
  toggleSpouse();
  $("title").addEventListener("change", () => {
    populate();
    if (D.titles[$("title").value].byDerece[$("derece").value]?.pensionSpecialServiceShare == null) $("law").value = "5510"; // 5434 share unknown
    render();
  });
  $("derece").addEventListener("change", () => { populate(); render(); });
  $("form").addEventListener("submit", (e) => { e.preventDefault(); render(); });
  $("form").addEventListener("change", (e) => {
    if (e.target.name === "mode") { applyMode(); render(); return; }
    if (e.target.id === "sDerece") populateSlip();
    if (!["title", "derece", "married"].includes(e.target.id)) render();
  });
  applyMode();
  $("lang").addEventListener("click", () => {
    lang = lang === "tr" ? "en" : "tr";
    try { localStorage.setItem("lang", lang); } catch {}
    applyStrings(); render();
  });
  render();
}

init();
