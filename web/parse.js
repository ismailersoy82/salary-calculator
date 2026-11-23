// Shared amount parser for every calculator page (no DOM, testable in Node).

/** Accepts "50000", "50.000", "50.000,50", "50,000.50". */
export function parseAmount(raw) {
  const s = String(raw).trim().replace(/\s|₺|TL|TRY/gi, "");
  if (!s) return NaN;
  const hasComma = s.includes(","), hasDot = s.includes(".");
  let norm;
  if (hasComma && hasDot) {
    // whichever separator comes last is the decimal one
    norm = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (hasComma) {
    norm = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (hasDot) {
    norm = /^\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, "") : s;
  } else norm = s;
  return /^\d+(\.\d+)?$/.test(norm) ? Number(norm) : NaN;
}
