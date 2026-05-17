import assert from "node:assert/strict";
import test from "node:test";

import { getToolsForRole } from "./tools.ts";

function toolNames(role: string) {
  return getToolsForRole(role).map((tool) => tool.function.name);
}

function assertIncludesAll(role: string, expected: string[]) {
  const names = toolNames(role);
  for (const name of expected) {
    assert.ok(names.includes(name), `${role} should expose ${name}`);
  }
}

function assertExcludesAll(role: string, forbidden: string[]) {
  const names = toolNames(role);
  for (const name of forbidden) {
    assert.ok(!names.includes(name), `${role} should not expose ${name}`);
  }
}

test("admin tools cover operational oversight capabilities", () => {
  assertIncludesAll("admin", [
    "get_today_operational_summary",
    "get_visits_by_status",
    "get_delayed_lab_orders",
    "get_low_stock_medicines",
    "get_expired_medicines",
    "get_audit_summary",
  ]);
  assertExcludesAll("admin", ["draft_diagnosis", "draft_prescription", "draft_dispense_action"]);
});

test("reception tools cover patient intake and queue capabilities", () => {
  assertIncludesAll("reception", [
    "get_open_visit",
    "get_queue_status",
    "get_pending_items_for_patient",
    "create_patient_draft",
    "create_visit_draft",
  ]);
  assertExcludesAll("reception", ["draft_diagnosis", "draft_prescription", "draft_lab_result_entry"]);
});

test("doctor tools cover clinical context and approval-required drafts", () => {
  assertIncludesAll("doctor", [
    "get_patient_summary",
    "get_previous_diagnoses",
    "get_medication_history",
    "get_pending_lab_results",
    "draft_diagnosis",
    "draft_lab_order",
    "draft_prescription",
    "prepare_visit_completion_notes",
  ]);
  assertExcludesAll("doctor", ["draft_dispense_action"]);
});

test("lab tools cover result queue, abnormal flagging, and workload", () => {
  assertIncludesAll("lab", [
    "get_delayed_lab_orders",
    "get_lab_workload_summary",
    "draft_lab_result_entry",
    "flag_abnormal_result",
  ]);
  assertExcludesAll("lab", ["draft_prescription", "draft_dispense_action"]);
});

test("pharmacy tools cover inventory, alternatives, and dispense drafts", () => {
  assertIncludesAll("pharmacy", [
    "get_low_stock_medicines",
    "get_expired_medicines",
    "get_expiring_batches",
    "suggest_available_alternatives",
    "draft_dispense_action",
    "create_restock_request_draft",
  ]);
  assertExcludesAll("pharmacy", ["draft_diagnosis", "draft_lab_order"]);
});

test("patient tools stay self-service only", () => {
  assertIncludesAll("patient", [
    "get_my_visit_status",
    "get_clinic_faq",
    "get_lab_preparation_instructions",
  ]);
  assertExcludesAll("patient", [
    "search_patients",
    "get_patient_profile",
    "draft_diagnosis",
    "draft_dispense_action",
  ]);
});
