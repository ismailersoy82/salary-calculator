// Amount parsing shared by the web pages. Run: node --test rules/tests/*.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount } from "../../web/parse.js";

test("TR thousands separator is not read as a decimal point", () => {
  assert.equal(parseAmount("243.795"), 243795);
  assert.equal(parseAmount("243.795,48"), 243795.48);
  assert.equal(parseAmount("1.234.567"), 1234567);
});

test("EN and plain forms", () => {
  assert.equal(parseAmount("243,795.48"), 243795.48);
  assert.equal(parseAmount("50000"), 50000);
  assert.equal(parseAmount("464,12"), 464.12);
  assert.equal(parseAmount("12.5"), 12.5);
  assert.equal(parseAmount(" 50.000 TL "), 50000);
});

test("empty and garbage give NaN", () => {
  assert.ok(Number.isNaN(parseAmount("")));
  assert.ok(Number.isNaN(parseAmount("abc")));
  assert.ok(Number.isNaN(parseAmount("-5")));
});
