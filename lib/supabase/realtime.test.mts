import assert from "node:assert/strict";
import test from "node:test";

type RealtimeModule = {
  getRealtimeTablesForWorkspace: (config: { table: string; mode?: string; dashboard?: boolean }) => string[];
  realtimeChannelName: (tables: readonly string[]) => string;
};

async function loadRealtimeModule(): Promise<RealtimeModule> {
  try {
    return await import("./realtime.ts") as RealtimeModule;
  } catch (error) {
    assert.fail(`lib/supabase/realtime.ts should expose workspace realtime helpers: ${error instanceof Error ? error.message : String(error)}`);
  }
}

test("getRealtimeTablesForWorkspace includes related workflow tables", async () => {
  const { getRealtimeTablesForWorkspace } = await loadRealtimeModule();

  assert.deepEqual(getRealtimeTablesForWorkspace({ table: "lab_orders", mode: "list" }), [
    "lab_orders",
    "lab_order_items",
    "visits",
  ]);

  assert.deepEqual(getRealtimeTablesForWorkspace({ table: "lab_results", mode: "list" }), [
    "lab_results",
    "visits",
  ]);

  assert.deepEqual(getRealtimeTablesForWorkspace({ table: "prescriptions", mode: "list" }), [
    "prescriptions",
    "prescription_items",
    "medicine_batches",
  ]);

  assert.deepEqual(getRealtimeTablesForWorkspace({ table: "appointment_requests", mode: "appointment-request-details" }), [
    "appointment_requests",
    "visits",
  ]);
});

test("getRealtimeTablesForWorkspace expands reports to operational source tables without duplicates", async () => {
  const { getRealtimeTablesForWorkspace } = await loadRealtimeModule();

  const tables = getRealtimeTablesForWorkspace({ table: "audit_logs", mode: "reports" });

  assert.ok(tables.includes("audit_logs"));
  assert.ok(tables.includes("visits"));
  assert.ok(tables.includes("lab_results"));
  assert.ok(tables.includes("lab_order_items"));
  assert.ok(tables.includes("prescriptions"));
  assert.ok(tables.includes("prescription_items"));
  assert.ok(tables.includes("medicine_order_items"));
  assert.ok(tables.includes("store_requests"));
  assert.equal(new Set(tables).size, tables.length);
});

test("realtimeChannelName is deterministic", async () => {
  const { realtimeChannelName } = await loadRealtimeModule();

  assert.equal(realtimeChannelName(["visits", "patients"]), "workspace:patients,visits");
  assert.equal(realtimeChannelName(["patients", "visits"]), "workspace:patients,visits");
});
