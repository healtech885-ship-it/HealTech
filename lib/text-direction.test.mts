import assert from "node:assert/strict";
import test from "node:test";

import { resolveTextDirection } from "./text-direction.ts";

test("resolveTextDirection treats Arabic as RTL", () => {
  assert.equal(resolveTextDirection("ازيك؟ محتاج اعرف نتيجة التحاليل"), "rtl");
});

test("resolveTextDirection skips neutral characters before Arabic", () => {
  assert.equal(resolveTextDirection("2026/05/17 - نتيجة التحليل جاهزة"), "rtl");
});

test("resolveTextDirection treats English as LTR", () => {
  assert.equal(resolveTextDirection("Your lab results are ready"), "ltr");
});

test("resolveTextDirection falls back to auto for neutral text", () => {
  assert.equal(resolveTextDirection("12345 ..."), "auto");
});
