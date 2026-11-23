import { calcMonth, calcYear } from "../rules/calc.js";
import { STRINGS, fill } from "./i18n.js";
import { parseAmount } from "./parse.js";

const PARAMS_URL = new URL("../rules/tr/2026.json", import.meta.url);
const $ = (id) => document.getElementById(id);

let params;
let lang = (() => {
  try { return localStorage.getItem("lang") || (navigator.language?.startsWith("tr") ? "tr" : "en"); }
  catch { return "tr"; }
})();
if (!STRINGS[lang]) lang = "tr";

const t = () => STRINGS[lang];
const money = (x) => new Intl.NumberFormat(t().locale, { style: "currency", currency: params.currency }).format(x);
const pct = (r) => new Intl.NumberFormat(t().locale, { maximumFractionDigits: 2 }).format(r * 100);

function applyStrings() {
  const s = t();
  document.documentElement.lang = lang;
  document.title = s.title;
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = s[el.dataset.i18n]; });
  $("subtitle").textContent = fill(s.subtitle, { year: params.year });
  $("lang").textContent = s.langSwitch;
  $("navPrivate").textContent = s.navPrivate;
  $("navMemur").textContent = s.navMemur;
  const sel = $("month"), cur = sel.value || String(new Date().getMonth() + 1);
  sel.innerHTML = s.months.map((m, i) => `<option value="${i + 1}">${m}</option>`).join("");
  sel.value = cur;
  const src = [params.minimumWage.source, params.incomeTax.source, params.socialSecurity.source, params.stampTax.source];
  $("sources").innerHTML = "";
  for (const line of src) { const li = document.createElement("li"); li.textContent = line; $("sources").append(li); }
}

function row(label, value, cls = "") {
  return `<div class="row ${cls}"><dt>${label}</dt><dd>${value}</dd></div>`;
}

function render() {
  const s = t();
  const err = $("error");
  const gross = parseAmount($("gross").value);
  const month = Number($("month").value);
  if ($("gross").value.trim() === "") { $("result").hidden = $("year").hidden = true; err.hidden = true; return; }
  if (!Number.isFinite(gross)) return showError(s.errNumber);
  if (gross < params.minimumWage.monthlyGross) return showError(fill(s.errMin, { min: money(params.minimumWage.monthlyGross) }));
  err.hidden = true;

  const m = calcMonth(params, gross, month);
  const ss = params.socialSecurity;
  $("netFor").textContent = fill(s.netFor, { month: s.months[month - 1] });
  $("netValue").textContent = money(m.net);
  $("breakdown").innerHTML = [
    row(s.gross, money(m.gross)),
    row(fill(s.sgk, { rate: pct(ss.employeeSgkRate) }), "−" + money(m.sgk)),
    row(fill(s.unemployment, { rate: pct(ss.employeeUnemploymentRate) }), "−" + money(m.unemployment)),
    row(s.incomeTaxGross, money(m.incomeTaxGross), "sub"),
    row(s.incomeTaxExemption, "−" + money(m.incomeTaxExemption), "sub"),
    row(s.incomeTax, "−" + money(m.incomeTax)),
    row(s.stampTaxGross, money(m.stampTaxGross), "sub"),
    row(s.stampTaxExemption, "−" + money(m.stampTaxExemption), "sub"),
    row(s.stampTax, "−" + money(m.stampTax)),
    row(s.net, money(m.net), "total"),
    row(s.employerCost, money(m.employerCost), "muted"),
  ].join("");

  const y = calcYear(params, gross);
  $("yearBody").innerHTML = y.months.map((r) =>
    `<tr${r.month === month ? ' class="current"' : ""}><td>${s.months[r.month - 1]}</td>` +
    `<td class="num">${money(r.cumulativeTaxBase)}</td><td class="num">${money(r.incomeTax)}</td>` +
    `<td class="num">${money(r.net)}</td></tr>`).join("");
  $("yearFoot").innerHTML = `<tr><td>${s.total}</td><td></td><td class="num">${money(y.totals.incomeTax)}</td>` +
    `<td class="num">${money(y.totals.net)}</td></tr>`;
  $("result").hidden = $("year").hidden = false;
}

function showError(msg) {
  $("error").textContent = msg;
  $("error").hidden = false;
  $("result").hidden = $("year").hidden = true;
}

async function init() {
  params = await (await fetch(PARAMS_URL)).json();
  applyStrings();
  $("gross").placeholder = new Intl.NumberFormat(t().locale).format(params.minimumWage.monthlyGross * 2);
  $("form").addEventListener("submit", (e) => { e.preventDefault(); render(); });
  $("month").addEventListener("change", render);
  $("lang").addEventListener("click", () => {
    lang = lang === "tr" ? "en" : "tr";
    try { localStorage.setItem("lang", lang); } catch {}
    applyStrings();
    render();
  });
}

init();
