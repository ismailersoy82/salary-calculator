import { calcMemurMonth, titleRule, raiseFactor, projectPeriod } from "../rules/memur.js";
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
  fillSelect($("title"), Object.entries(D.titles).map(([id, tt]) => [id, tt.name[lang]]));
  const tt = D.titles[$("title").value];
  fillSelect($("derece"), Object.keys(tt.byDerece).map((d) => [d, d]));
  const row = D.period.salaryScale[$("derece").value];
  fillSelect($("kademe"), row.map((g, i) => [i + 1, `${i + 1} (${g})`]), $("kademe").value || 2);
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
  for (const line of [D.period.coefficients.source, D.period.salaryScale.source, D.taxYear.incomeTax.source, D.cpi.series + " — " + Object.values(D.cpi.monthly).map((x) => x.source).join("; ")]) {
    const li = document.createElement("li"); li.textContent = line; $("sources").append(li);
  }
  populate();
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
  try {
    const person = readPerson();
    const rule = titleRule(D.titles, $("title").value, person.derece);

    // Current month: if the payslip's prior cumulative base is not given, estimate it (Jan–Jun at the H1 coefficient ratio).
    const probe = calcMemurMonth(D.period, D.taxYear, rule, { ...person, month: CURRENT_MONTH, priorTaxBase: 0 });
    const priorInput = num($("prior").value);
    const h1Ratio = D.period.previousPeriod.monthly / D.period.coefficients.monthly;
    const priorEst = Math.round((probe.taxBase * 6 * h1Ratio + probe.taxBase * (CURRENT_MONTH - 7)) * 100) / 100;
    const prior = Number.isFinite(priorInput) ? priorInput : priorEst;
    const now = calcMemurMonth(D.period, D.taxYear, rule, { ...person, month: CURRENT_MONTH, priorTaxBase: prior });

    // January 2027: Jul–Dec CPI (official + scenario), new period, tax year restarts.
    const months = [...Object.values(D.cpi.monthly).map((x) => x.pct), Number($("cpiNov").value) || 0, Number($("cpiDec").value) || 0];
    const r = raiseFactor(months.slice(0, 6), 0.07, 0.05);
    const p27 = projectPeriod(D.period, r.factor, "2027-H1 (tahmin)");
    p27.indicators = D.period.indicators;
    const jan = calcMemurMonth(p27, D.taxYear, rule, { ...person, month: 1, priorTaxBase: 0 });

    $("nowTitle").textContent = fill(ms.nowTitle, { month: t().months[CURRENT_MONTH - 1] }) + (Number.isFinite(priorInput) ? "" : ` (${ms.estimated})`);
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

    $("colNow").textContent = `${t().months[CURRENT_MONTH - 1].slice(0, 3)} 2026`;
    $("colJan").textContent = `${t().months[0].slice(0, 3)} 2027`;
    const keys = ["salary", "extraIndicator", "base", "seniority", "sidePayment", "specialService", "supplementary", "additional", "collectiveBonus", "children", "spouse"];
    const rows = keys.filter((k) => now.lines[k] || jan.lines[k]).map((k) => [ms[k], now.lines[k], jan.lines[k], ""]);
    const sum = (o) => Object.values(o.lines).reduce((a, b) => a + b, 0);
    rows.push([ms.earnings, sum(now), sum(jan), "total"]);
    rows.push([ms.pension, -now.pensionEmployee, -jan.pensionEmployee, ""]);
    if (now.unionDues) rows.push([ms.unionDues, -now.unionDues, -jan.unionDues, ""]);
    rows.push([ms.incomeTax, -now.incomeTax, -jan.incomeTax, ""]);
    rows.push([ms.stampTax, -now.stampTax, -jan.stampTax, ""]);
    rows.push([ms.net, now.net, jan.net, "total"]);
    $("lines").innerHTML = rows.map(([label, a, b, cls]) =>
      `<tr class="${cls}"><td>${label}</td><td class="num">${money(a)}</td><td class="num">${money(b)}</td></tr>`).join("");
    $("out").hidden = false;
  } catch (e) {
    $("out").hidden = true;
    $("error").textContent = /spouse/.test(e.message) ? ms.errSpouse : fill(ms.errGeneric, { msg: e.message });
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
  $("title").addEventListener("change", () => { populate(); render(); });
  $("derece").addEventListener("change", () => { populate(); render(); });
  $("form").addEventListener("submit", (e) => { e.preventDefault(); render(); });
  $("form").addEventListener("change", (e) => { if (!["title", "derece", "married"].includes(e.target.id)) render(); });
  $("lang").addEventListener("click", () => {
    lang = lang === "tr" ? "en" : "tr";
    try { localStorage.setItem("lang", lang); } catch {}
    applyStrings(); render();
  });
  render();
}

init();
