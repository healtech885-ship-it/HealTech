import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PUBLIC_SOLUTIONS } from "./public-search-data.ts";
import { searchPublicSolutions } from "./public-solution-search.ts";

function resultIds(query: string, audience: "clinic-teams" | "patients" | "both") {
  return searchPublicSolutions(query, audience, { includeAllMatches: true }).results.map((result) => result.item.id);
}

test("public search ranks prescription results by selected audience", () => {
  const clinicResults = resultIds("prescription", "clinic-teams");
  const patientResults = resultIds("prescription", "patients");

  assert.ok(["pharmacy-stock", "doctor-workspace"].includes(clinicResults[0]), "clinic teams should see staff prescription tools first");
  assert.equal(patientResults[0], "patient-portal");
});

test("public search resolves common synonyms", () => {
  assert.equal(resultIds("physician", "clinic-teams")[0], "doctor-workspace");
  assert.equal(resultIds("front desk", "clinic-teams")[0], "reception-queue");
  assert.equal(resultIds("blood test", "clinic-teams")[0], "lab-orders-results");
  assert.equal(resultIds("invoice", "clinic-teams")[0], "billing-admin");
  assert.equal(resultIds("automation", "clinic-teams")[0], "ai-clinical-assistant");
  assert.equal(resultIds("price", "clinic-teams")[0], "pricing");
});

test("public search returns popular solutions for empty queries", () => {
  const response = searchPublicSolutions("", "clinic-teams");

  assert.equal(response.intent, "popular");
  assert.deepEqual(
    response.results.slice(0, 3).map((result) => result.item.id),
    ["reception-queue", "doctor-workspace", "lab-orders-results"],
  );
});

test("public search falls back gracefully when there is no strong match", () => {
  const response = searchPublicSolutions("zzzz unavailable phrase", "patients");

  assert.equal(response.intent, "fallback");
  assert.deepEqual(
    response.results.map((result) => result.item.id),
    ["appointment-management", "patient-follow-up", "ai-clinical-assistant"],
  );
});

test("public search data uses only static public metadata", async () => {
  assert.ok(PUBLIC_SOLUTIONS.length >= 12);

  const dataSource = await readFile("lib/public-search-data.ts", "utf8");
  const searchSource = await readFile("lib/public-solution-search.ts", "utf8");
  const combinedSource = `${dataSource}\n${searchSource}`;

  assert.doesNotMatch(combinedSource, /supabase|healtech-chat|demo-data|auth\/session|api\/healtech-chat/i);
  assert.ok(PUBLIC_SOLUTIONS.every((item) => item.path.startsWith("#")), "public solution CTAs should use homepage anchors in this pass");
});
