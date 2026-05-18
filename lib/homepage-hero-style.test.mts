import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("homepage hero uses the dedicated display font", async () => {
  const layout = await readFile("app/layout.tsx", "utf8");
  const homepage = await readFile("components/public/homepage-client.tsx", "utf8");

  assert.match(layout, /Plus_Jakarta_Sans/);
  assert.match(layout, /--font-hero/);
  assert.match(homepage, /font-\[var\(--font-hero\)\]/);
  assert.match(homepage, /text-balance/);
});
