// HealTech Agent Tool Definitions
// These are OpenAI-compatible function calling tool definitions. Handlers live in tool-handlers.ts.

type JsonSchemaProperty = {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object";
  description?: string;
  enum?: string[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
};

export type AgentToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, JsonSchemaProperty>;
      required: string[];
    };
  };
};

function defineTool(
  name: string,
  description: string,
  properties: Record<string, JsonSchemaProperty> = {},
  required: string[] = [],
): AgentToolDefinition {
  return {
    type: "function",
    function: {
      name,
      description,
      parameters: { type: "object", properties, required },
    },
  };
}

const patientIdParam = { type: "string", description: "The patient UUID" } satisfies JsonSchemaProperty;
const visitIdParam = { type: "string", description: "The visit UUID" } satisfies JsonSchemaProperty;
const labOrderIdParam = { type: "string", description: "The lab order UUID" } satisfies JsonSchemaProperty;
const medicineOrderIdParam = { type: "string", description: "The medicine order UUID" } satisfies JsonSchemaProperty;

// Shared read tools
const searchPatients = defineTool(
  "search_patients",
  "Search for patients by name, MRN, or student ID. Returns up to 10 matching patient profiles.",
  {
    query: { type: "string", description: "Search term: patient name, MRN, or student ID" },
  },
  ["query"],
);

const getPatientProfile = defineTool(
  "get_patient_profile",
  "Get a single patient's profile including demographics, contact info, and department.",
  { patient_id: patientIdParam },
  ["patient_id"],
);

const getTodayVisits = defineTool(
  "get_today_visits",
  "Get clinic visits created today with patient names, doctor names, status, and priority.",
  {
    status: {
      type: "string",
      description: "Optional filter by visit status",
      enum: ["queued", "in_progress", "waiting_lab", "lab_completed", "waiting_pharmacy", "completed", "cancelled"],
    },
  },
);

const getVisitDetails = defineTool(
  "get_visit_details",
  "Get full details of a specific visit including symptoms, diagnosis fields, doctor notes, and patient context.",
  { visit_id: visitIdParam },
  ["visit_id"],
);

const getPatientVisits = defineTool(
  "get_patient_visits",
  "Get visits for a specific patient, ordered by most recent first.",
  { patient_id: patientIdParam },
  ["patient_id"],
);

const getOpenVisit = defineTool(
  "get_open_visit",
  "Check whether a patient has an open clinic visit that is not completed or cancelled.",
  { patient_id: patientIdParam },
  ["patient_id"],
);

const getQueueStatus = defineTool(
  "get_queue_status",
  "Summarize today's visit queue by status and priority, with recent queued or waiting visits.",
  {
    status: {
      type: "string",
      description: "Optional visit status filter",
      enum: ["queued", "in_progress", "waiting_lab", "lab_completed", "waiting_pharmacy", "completed", "cancelled"],
    },
  },
);

const getPendingItemsForPatient = defineTool(
  "get_pending_items_for_patient",
  "Check pending lab orders, medicine orders, and appointment requests for one patient.",
  { patient_id: patientIdParam },
  ["patient_id"],
);

// Reception draft tools
const createPatientDraft = defineTool(
  "create_patient_draft",
  "Prepare a patient registration draft only. This never writes to the database and requires staff approval.",
  {
    full_name: { type: "string", description: "Patient full name" },
    student_id: { type: "string", description: "Optional student ID" },
    mrn: { type: "string", description: "Optional medical record number" },
    phone: { type: "string", description: "Optional phone number" },
    gender: { type: "string", description: "Optional gender" },
    birth_date: { type: "string", description: "Optional birth date in YYYY-MM-DD format" },
    department_id: { type: "string", description: "Optional department UUID" },
  },
  ["full_name"],
);

const createVisitDraft = defineTool(
  "create_visit_draft",
  "Prepare a visit creation draft only. This never writes to the database and requires staff approval.",
  {
    patient_id: patientIdParam,
    doctor_id: { type: "string", description: "Doctor profile UUID" },
    chief_complaint: { type: "string", description: "Chief complaint or reason for visit" },
    priority: { type: "string", description: "Visit priority", enum: ["low", "normal", "high", "urgent"] },
    notes: { type: "string", description: "Optional reception notes" },
  },
  ["patient_id", "doctor_id", "chief_complaint"],
);

// Doctor tools
const getPatientSummary = defineTool(
  "get_patient_summary",
  "Build a clinician-facing patient summary from profile, recent visits, labs, medicines, and pending items.",
  { patient_id: patientIdParam },
  ["patient_id"],
);

const getPreviousDiagnoses = defineTool(
  "get_previous_diagnoses",
  "Get prior diagnosis and disease notes for a patient from completed or historical visits.",
  { patient_id: patientIdParam },
  ["patient_id"],
);

const getMedicationHistory = defineTool(
  "get_medication_history",
  "Get prior medicine orders and dispensing status for a patient.",
  { patient_id: patientIdParam },
  ["patient_id"],
);

const getPendingLabResults = defineTool(
  "get_pending_lab_results",
  "Get pending, entered, or submitted lab result items awaiting clinician review. Can be scoped to a patient.",
  {
    patient_id: { type: "string", description: "Optional patient UUID" },
  },
);

const draftDiagnosis = defineTool(
  "draft_diagnosis",
  "Prepare diagnosis notes for doctor approval. This never writes to the database.",
  {
    visit_id: visitIdParam,
    diagnosis: { type: "string", description: "Draft diagnosis text" },
    disease: { type: "string", description: "Optional disease label" },
    symptoms: { type: "string", description: "Optional symptom summary" },
    notes: { type: "string", description: "Optional clinical notes" },
    instructions: { type: "string", description: "Optional patient instructions for doctor review" },
  },
  ["visit_id", "diagnosis"],
);

const draftLabOrder = defineTool(
  "draft_lab_order",
  "Prepare a lab-order draft for doctor approval. This never writes to the database.",
  {
    visit_id: visitIdParam,
    lab_test_ids: {
      type: "array",
      description: "Optional lab test UUIDs",
      items: { type: "string", description: "Lab test UUID" },
    },
    test_names: {
      type: "array",
      description: "Optional human-readable test names when UUIDs are not known",
      items: { type: "string", description: "Lab test name" },
    },
    reason: { type: "string", description: "Clinical reason for ordering the tests" },
  },
  ["visit_id"],
);

const draftPrescription = defineTool(
  "draft_prescription",
  "Prepare a prescription draft for doctor approval. This never writes to the database.",
  {
    visit_id: visitIdParam,
    medicines: {
      type: "array",
      description: "Medicine draft items",
      items: {
        type: "object",
        description: "One medicine item",
        properties: {
          medicine_id: { type: "string", description: "Optional medicine UUID" },
          medicine_name: { type: "string", description: "Medicine name if UUID is not known" },
          requested_quantity: { type: "integer", description: "Requested quantity" },
          dosage_instructions: { type: "string", description: "Dosage instructions for doctor review" },
        },
      },
    },
    doctor_notes: { type: "string", description: "Optional doctor notes" },
  },
  ["visit_id", "medicines"],
);

const prepareVisitCompletionNotes = defineTool(
  "prepare_visit_completion_notes",
  "Prepare visit completion notes and follow-up checklist for doctor approval. This never writes to the database.",
  {
    visit_id: visitIdParam,
    summary: { type: "string", description: "Draft visit summary" },
    follow_up: { type: "string", description: "Follow-up instructions or next-step checklist" },
  },
  ["visit_id", "summary"],
);

// Lab tools
const getPendingLabOrders = defineTool(
  "get_pending_lab_orders",
  "Get lab orders with status ordered. Includes patient and doctor info.",
);

const getLabOrderDetails = defineTool(
  "get_lab_order_details",
  "Get full details of a lab order including test items and result values.",
  { lab_order_id: labOrderIdParam },
  ["lab_order_id"],
);

const getPatientLabResults = defineTool(
  "get_patient_lab_results",
  "Get lab results for a patient. Patients only receive visible-to-patient results.",
  { patient_id: patientIdParam },
  ["patient_id"],
);

const getDelayedLabOrders = defineTool(
  "get_delayed_lab_orders",
  "Find lab orders that have been waiting longer than the configured threshold.",
  {
    minutes_threshold: { type: "integer", description: "Delay threshold in minutes. Defaults to 120." },
  },
);

const getLabWorkloadSummary = defineTool(
  "get_lab_workload_summary",
  "Summarize lab workload by order status and result status.",
);

const draftLabResultEntry = defineTool(
  "draft_lab_result_entry",
  "Prepare a lab result entry draft for staff approval. This never writes to the database.",
  {
    lab_result_id: { type: "string", description: "Lab result item UUID or lab order item UUID" },
    result_value: { type: "string", description: "Result value to draft" },
    result_notes: { type: "string", description: "Optional lab notes" },
  },
  ["lab_result_id", "result_value"],
);

const flagAbnormalResult = defineTool(
  "flag_abnormal_result",
  "Flag whether a lab value appears outside a simple numeric normal range. This is review support, not a diagnosis.",
  {
    result_value: { type: "string", description: "Observed lab value" },
    normal_range: { type: "string", description: "Normal range text, for example 4.0-10.0" },
    lab_test_name: { type: "string", description: "Optional lab test name" },
  },
  ["result_value", "normal_range"],
);

// Pharmacy tools
const getPendingPrescriptions = defineTool(
  "get_pending_prescriptions",
  "Get medicine orders awaiting pharmacy dispensing. Includes patient and doctor info.",
);

const getMedicineStock = defineTool(
  "get_medicine_stock",
  "Get current medicine stock including batch quantities, expiry dates, and low-stock alerts.",
  {
    filter: { type: "string", description: "Optional filter", enum: ["all", "low_stock", "expired", "expiring_soon"] },
  },
);

const getPrescriptionDetails = defineTool(
  "get_prescription_details",
  "Get full details of a medicine order including items, quantities, and dispensing status.",
  { medicine_order_id: medicineOrderIdParam },
  ["medicine_order_id"],
);

const getLowStockMedicines = defineTool(
  "get_low_stock_medicines",
  "Get in-stock medicine batches with quantity at or below the low-stock threshold.",
);

const getExpiredMedicines = defineTool(
  "get_expired_medicines",
  "Get medicine batches with expiry dates earlier than today.",
);

const getExpiringBatches = defineTool(
  "get_expiring_batches",
  "Get medicine batches expiring soon.",
  {
    days: { type: "integer", description: "Number of days ahead to check. Defaults to 30." },
  },
);

const suggestAvailableAlternatives = defineTool(
  "suggest_available_alternatives",
  "Suggest active medicines with available stock in the same category or matching a medicine name.",
  {
    medicine_name: { type: "string", description: "Optional medicine name to match" },
    category: { type: "string", description: "Optional medicine category to match" },
  },
);

const draftDispenseAction = defineTool(
  "draft_dispense_action",
  "Prepare a dispense action draft after checking available stock. This never decrements stock.",
  {
    prescription_item_id: { type: "string", description: "Medicine order item UUID" },
    quantity: { type: "integer", description: "Quantity to dispense" },
  },
  ["prescription_item_id", "quantity"],
);

const createRestockRequestDraft = defineTool(
  "create_restock_request_draft",
  "Prepare a restock request draft for approval. This never writes to the database.",
  {
    medicine_name_id: { type: "string", description: "Medicine UUID" },
    requested_quantity: { type: "integer", description: "Requested restock quantity" },
    reason: { type: "string", description: "Reason for restock request" },
  },
  ["medicine_name_id", "requested_quantity"],
);

// Admin tools
const getDashboardCounters = defineTool(
  "get_dashboard_counters",
  "Get live operational counters: employees, doctors, patients, visits, labs, prescriptions, stock, and leave requests.",
);

const getDepartmentWorkload = defineTool(
  "get_department_workload",
  "Get active departments for operational load review.",
);

const getAuditLogs = defineTool(
  "get_audit_logs",
  "Get recent audit log entries for compliance review.",
  {
    limit: { type: "integer", description: "Number of recent entries to retrieve. Defaults to 20, max 50." },
  },
);

const getLeaveRequests = defineTool(
  "get_leave_requests",
  "Get employee leave requests, optionally filtered by status.",
  {
    status: { type: "string", description: "Filter by status", enum: ["pending", "approved", "rejected", "cancelled"] },
  },
);

const getTodayOperationalSummary = defineTool(
  "get_today_operational_summary",
  "Build an admin operational summary from counters, queue status, delayed lab work, pending prescriptions, and inventory alerts.",
);

const getVisitsByStatus = defineTool(
  "get_visits_by_status",
  "Get visit counts grouped by status for a specific date or for today.",
  {
    date: { type: "string", description: "Optional date in YYYY-MM-DD format. Defaults to today." },
  },
);

const getAuditSummary = defineTool(
  "get_audit_summary",
  "Summarize recent audit logs by action and entity type.",
  {
    limit: { type: "integer", description: "Number of recent logs to summarize. Defaults to 100, max 200." },
  },
);

// Patient self-service tools
const getMyVisits = defineTool(
  "get_my_visits",
  "Get the authenticated patient's own visits.",
);

const getMyLabResults = defineTool(
  "get_my_lab_results",
  "Get the authenticated patient's approved lab results only.",
);

const getMyPrescriptions = defineTool(
  "get_my_prescriptions",
  "Get the authenticated patient's prescriptions and dispensing status.",
);

const getMyAppointmentRequests = defineTool(
  "get_my_appointment_requests",
  "Get the authenticated patient's appointment requests and their status.",
);

const getMyVisitStatus = defineTool(
  "get_my_visit_status",
  "Get the authenticated patient's latest and currently open visit status.",
);

const getClinicFaq = defineTool(
  "get_clinic_faq",
  "Answer clinic workflow FAQ for patients without exposing internal staff data.",
  {
    topic: {
      type: "string",
      description: "Optional FAQ topic",
      enum: ["appointments", "visits", "lab_results", "prescriptions", "emergency", "contact", "general"],
    },
  },
);

const getLabPreparationInstructions = defineTool(
  "get_lab_preparation_instructions",
  "Provide general lab preparation instructions and remind patients to follow clinician-specific instructions.",
  {
    test_name: { type: "string", description: "Optional lab test name" },
  },
);

export function getToolsForRole(role: string): AgentToolDefinition[] {
  switch (role) {
    case "admin":
      return [
        searchPatients, getPatientProfile, getTodayVisits, getVisitDetails,
        getPatientVisits, getPendingLabOrders, getDelayedLabOrders,
        getPendingPrescriptions, getMedicineStock, getLowStockMedicines,
        getExpiredMedicines, getDashboardCounters, getDepartmentWorkload,
        getAuditLogs, getLeaveRequests, getTodayOperationalSummary,
        getVisitsByStatus, getAuditSummary,
      ];
    case "reception":
      return [
        searchPatients, getPatientProfile, getTodayVisits, getVisitDetails,
        getPatientVisits, getOpenVisit, getQueueStatus,
        getPendingItemsForPatient, createPatientDraft, createVisitDraft,
      ];
    case "doctor":
      return [
        searchPatients, getPatientProfile, getTodayVisits, getVisitDetails,
        getPatientVisits, getPatientSummary, getPreviousDiagnoses,
        getMedicationHistory, getPatientLabResults, getPendingLabResults,
        getPendingLabOrders, getLabOrderDetails, draftDiagnosis,
        draftLabOrder, draftPrescription, prepareVisitCompletionNotes,
      ];
    case "lab":
      return [
        getPendingLabOrders, getLabOrderDetails, getPatientLabResults,
        getVisitDetails, getDelayedLabOrders, getLabWorkloadSummary,
        draftLabResultEntry, flagAbnormalResult,
      ];
    case "pharmacy":
      return [
        getPendingPrescriptions, getPrescriptionDetails, getMedicineStock,
        getVisitDetails, getLowStockMedicines, getExpiredMedicines,
        getExpiringBatches, suggestAvailableAlternatives, draftDispenseAction,
        createRestockRequestDraft,
      ];
    case "patient":
      return [
        getMyVisits, getMyLabResults, getMyPrescriptions,
        getMyAppointmentRequests, getMyVisitStatus, getClinicFaq,
        getLabPreparationInstructions,
      ];
    default:
      return [];
  }
}
