// ─── HealTech Agent Permissions ─────────────────────────────────────────────
// Role → allowed actions map per the agentic reference architecture (Sections 7, 14).

import type { UserRole } from "@/types/app.types";
import type { SafetyClass } from "./types";

// ─── Role Scope Definitions ─────────────────────────────────────────────────

type RoleScopeEntry = {
  /** Human-readable label for the role's AI scope. */
  label: string;
  /** Allowed intent categories for this role. */
  allowed_intents: string[];
  /** Explicitly forbidden intents for this role. */
  forbidden_intents: string[];
  /** Maximum safety class this role can trigger through AI. */
  max_safety_class: SafetyClass;
};

const ROLE_SCOPES: Record<UserRole, RoleScopeEntry> = {
  admin: {
    label: "Operational summaries, employee/admin workflows, settings, audit review, inventory overview",
    allowed_intents: [
      "operational_summary", "dashboard_counters", "visits_by_status",
      "department_load", "delayed_lab_orders", "pending_prescriptions",
      "low_stock_medicines", "expired_medicines", "leave_requests",
      "audit_summary", "bottleneck_detection",
    ],
    forbidden_intents: [
      "diagnose_patient", "recommend_medication", "dispense_medicine",
      "interpret_lab_results", "create_prescription",
    ],
    max_safety_class: "draft",
  },

  reception: {
    label: "Patient registration, visit creation, appointment handling, queue visibility",
    allowed_intents: [
      "search_patient", "patient_profile", "open_visit_check",
      "today_visits", "queue_status", "create_patient_draft",
      "create_visit_draft", "pending_items_for_patient", "appointment_handling",
    ],
    forbidden_intents: [
      "diagnose_patient", "recommend_medication", "approve_lab_results",
      "create_prescription", "dispense_medicine", "interpret_lab_results",
    ],
    max_safety_class: "draft",
  },

  doctor: {
    label: "Patient summary, visit context, diagnosis draft, lab-order draft, prescription draft",
    allowed_intents: [
      "patient_summary", "visit_details", "previous_diagnoses",
      "medication_history", "approved_lab_results", "pending_lab_results",
      "draft_diagnosis", "draft_lab_order", "draft_prescription",
      "abnormal_lab_flagging", "visit_completion_notes",
    ],
    forbidden_intents: [
      "dispense_medicine", "admin_operations", "create_patient",
    ],
    max_safety_class: "draft",
  },

  lab: {
    label: "Pending lab orders, result entry draft, abnormal result flagging",
    allowed_intents: [
      "pending_lab_orders", "delayed_lab_orders", "lab_order_details",
      "lab_result_draft", "abnormal_result_flagging", "doctor_review_send",
      "lab_workload_summary",
    ],
    forbidden_intents: [
      "diagnose_patient", "recommend_medication", "create_prescription",
      "dispense_medicine", "admin_operations",
    ],
    max_safety_class: "draft",
  },

  pharmacy: {
    label: "Prescription review, stock checks, dispensing workflow, restock suggestions",
    allowed_intents: [
      "pending_prescriptions", "prescription_details", "medicine_stock_check",
      "expiring_batches", "expired_medicines", "low_stock_medicines",
      "available_alternatives", "dispense_draft", "restock_request_draft",
    ],
    forbidden_intents: [
      "diagnose_patient", "create_prescription", "interpret_lab_results",
      "edit_diagnosis", "admin_operations",
    ],
    max_safety_class: "draft",
  },

  patient: {
    label: "Limited self-service: appointment status, approved results, approved prescriptions, clinic FAQ",
    allowed_intents: [
      "my_appointments", "my_visit_status", "my_approved_lab_results",
      "my_approved_prescriptions", "clinic_faq", "lab_preparation_instructions",
    ],
    forbidden_intents: [
      "diagnose_patient", "recommend_medication", "interpret_lab_results",
      "access_other_patient_data", "internal_operations", "staff_workflows",
      "admin_operations", "create_prescription", "dispense_medicine",
    ],
    max_safety_class: "read",
  },
};

// ─── Public API ─────────────────────────────────────────────────────────────

/** Get the scope definition for a given role. */
export function getRoleScope(role: UserRole): RoleScopeEntry {
  return ROLE_SCOPES[role];
}

/** Check if a role is allowed to perform a given intent. */
export function isIntentAllowed(role: UserRole, intent: string): boolean {
  const scope = ROLE_SCOPES[role];
  if (scope.forbidden_intents.includes(intent)) return false;
  return scope.allowed_intents.includes(intent);
}

/** Get the maximum safety class a role can reach through the AI. */
export function getMaxSafetyClass(role: UserRole): SafetyClass {
  return ROLE_SCOPES[role].max_safety_class;
}

/** All roles that have access to the AI assistant. */
export const AI_ENABLED_ROLES: UserRole[] = [
  "admin", "reception", "doctor", "lab", "pharmacy", "patient",
];
