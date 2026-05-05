import assert from "node:assert/strict";
import test from "node:test";
import { getSafeRedirectPath } from "./redirects.ts";

const fallback = "/dashboard";

test("getSafeRedirectPath allows safe internal paths", () => {
  const safeValues = [
    "/dashboard",
    "/admin/dashboard",
    "/doctor/dashboard",
    "/reception/dashboard",
    "/lab/dashboard",
    "/pharmacy/dashboard",
    "/patient/dashboard",
    "/login?error=missing-role",
  ];

  for (const value of safeValues) {
    assert.equal(getSafeRedirectPath(value, fallback), value);
  }
});

test("getSafeRedirectPath returns fallback for unsafe values", () => {
  const unsafeValues = [
    null,
    undefined,
    "",
    "https://evil.com",
    "http://evil.com",
    "//evil.com",
    "///evil.com",
    "\\\\evil.com",
    "/\\evil.com",
    "/\\\\evil.com",
    "javascript:alert(1)",
    "data:text/html;base64,abc",
    "%2F%2Fevil.com",
    "%5C%5Cevil.com",
    "%68%74%74%70%73%3A%2F%2Fevil.com",
    "/dashboard%0d%0aLocation:%20https://evil.com",
  ];

  for (const value of unsafeValues) {
    assert.equal(getSafeRedirectPath(value, fallback), fallback);
  }
});

test("getSafeRedirectPath falls back to a safe default if fallback is unsafe", () => {
  assert.equal(getSafeRedirectPath("https://evil.com", "//evil.com"), fallback);
});
