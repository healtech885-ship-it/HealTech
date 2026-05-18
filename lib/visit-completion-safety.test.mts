import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("update-visit validates required completion fields before completing", () => {
  const source = readProjectFile("supabase/functions/update-visit/index.ts");

  assert.match(source, /\.select\("id,doctor_id,status,diagnosis,doctor_instructions"\)/);
  assert.match(source, /body\.complete === true/);
  assert.match(source, /Diagnosis is required before completing visit/);
  assert.match(source, /Doctor instructions are required before completing visit/);
  assert.match(source, /supabase\.rpc\("complete_visit"/);
});

test("complete_visit database function enforces actor and clinical completion guards", () => {
  const migration = readProjectFile("supabase/migrations/20260518130000_route_orders_to_selected_lab_and_pharmacy.sql");

  assert.match(migration, /create or replace function public\.complete_visit\(target_visit_id uuid, actor uuid\)/);
  assert.match(migration, /visit_row\.doctor_id is distinct from actor/);
  assert.match(migration, /Visit is not assigned to current doctor/);
  assert.match(migration, /visit_row\.diagnosis is null/);
  assert.match(migration, /visit_row\.doctor_instructions is null/);
  assert.match(migration, /status = 'completed'/);
  assert.match(migration, /grant execute on function public\.complete_visit\(uuid, uuid\) to service_role/);
});

test("doctor order entry points require explicit lab and pharmacy routing", () => {
  const workspaceConfig = readProjectFile("lib/workspaces.ts");
  const workspaceClient = readProjectFile("components/workspace-client.tsx");
  const requestLabTests = readProjectFile("supabase/functions/request-lab-tests/index.ts");
  const createPrescription = readProjectFile("supabase/functions/create-prescription/index.ts");

  assert.match(workspaceConfig, /name: "target_lab_id", label: "Receiving laboratory", required: true, reference: "labs"/);
  assert.match(workspaceConfig, /name: "target_pharmacy_id", label: "Receiving pharmacy", required: true, reference: "pharmacies"/);
  assert.match(workspaceClient, /target_pharmacy_id: payload\.target_pharmacy_id/);
  assert.match(workspaceClient, /medicine_id: payload\.medicine_id \?\? payload\.medicine_name_id/);
  assert.match(requestLabTests, /requireFields\(body, \["visit_id", "lab_test_ids", "target_lab_id"\]\)/);
  assert.match(requestLabTests, /target_lab_id: body\.target_lab_id/);
  assert.match(createPrescription, /requireFields\(body, \["visit_id", "items", "target_pharmacy_id"\]\)/);
  assert.match(createPrescription, /target_pharmacy_id: body\.target_pharmacy_id/);
});
