// HealTech Agent Tool Handlers
// Server-side tool execution for AI function calls. These handlers must not bypass RLS.

import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database.types";

type ToolResult = {
  success: boolean;
  data: unknown;
  error?: string;
};

type ToolContext = {
  userRole: string;
  userId?: string;
  patientId?: string;
};

type VisitStatus = Enums<"visit_status">;
type VisitPriority = Enums<"visit_priority">;
type LabOrderStatus = Enums<"lab_order_status">;
type LabResultStatus = Enums<"lab_result_status">;
type MedicineOrderStatus = Enums<"medicine_order_status">;
type MedicineBatchStatus = Enums<"medicine_batch_status">;
type LeaveRequestStatus = Enums<"leave_request_status">;
type AppointmentRequestStatus = Enums<"appointment_request_status">;

const VISIT_STATUSES = ["queued", "in_progress", "waiting_lab", "lab_completed", "waiting_pharmacy", "completed", "cancelled"] as const satisfies readonly VisitStatus[];
const ACTIVE_VISIT_STATUSES = ["queued", "in_progress", "waiting_lab", "lab_completed", "waiting_pharmacy"] as const satisfies readonly VisitStatus[];
const VISIT_PRIORITIES = ["low", "normal", "high", "urgent"] as const satisfies readonly VisitPriority[];
const LAB_ORDER_STATUSES = ["ordered", "in_progress", "pending_review", "completed", "cancelled"] as const satisfies readonly LabOrderStatus[];
const ACTIVE_LAB_ORDER_STATUSES = ["ordered", "in_progress", "pending_review"] as const satisfies readonly LabOrderStatus[];
const LAB_RESULT_STATUSES = ["pending", "entered", "submitted", "reviewed"] as const satisfies readonly LabResultStatus[];
const PENDING_LAB_RESULT_STATUSES = ["pending", "entered", "submitted"] as const satisfies readonly LabResultStatus[];
const ACTIVE_MEDICINE_ORDER_STATUSES = ["ordered", "partially_dispensed"] as const satisfies readonly MedicineOrderStatus[];
const LEAVE_REQUEST_STATUSES = ["pending", "approved", "rejected", "cancelled"] as const satisfies readonly LeaveRequestStatus[];
const PENDING_APPOINTMENT_STATUSES = ["pending", "approved"] as const satisfies readonly AppointmentRequestStatus[];

export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  context: ToolContext,
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case "search_patients":
        return await handleSearchPatients(getString(args, "query"));
      case "get_patient_profile":
        return await handleGetPatientProfile(getString(args, "patient_id"));
      case "get_today_visits":
        return await handleGetTodayVisits(getOptionalString(args, "status"));
      case "get_visit_details":
        return await handleGetVisitDetails(getString(args, "visit_id"));
      case "get_patient_visits":
        return await handleGetPatientVisits(getString(args, "patient_id"));
      case "get_open_visit":
        return await handleGetOpenVisit(getString(args, "patient_id"));
      case "get_queue_status":
        return await handleGetQueueStatus(getOptionalString(args, "status"));
      case "get_pending_items_for_patient":
        return await handleGetPendingItemsForPatient(getString(args, "patient_id"));
      case "create_patient_draft":
        return handleCreatePatientDraft(args);
      case "create_visit_draft":
        return handleCreateVisitDraft(args);
      case "get_patient_summary":
        return await handleGetPatientSummary(getString(args, "patient_id"));
      case "get_previous_diagnoses":
        return await handleGetPreviousDiagnoses(getString(args, "patient_id"));
      case "get_medication_history":
        return await handleGetMedicationHistory(getString(args, "patient_id"));
      case "get_pending_lab_results":
        return await handleGetPendingLabResults(getOptionalString(args, "patient_id"));
      case "draft_diagnosis":
        return handleDraftDiagnosis(args);
      case "draft_lab_order":
        return handleDraftLabOrder(args);
      case "draft_prescription":
        return handleDraftPrescription(args);
      case "prepare_visit_completion_notes":
        return handlePrepareVisitCompletionNotes(args);
      case "get_pending_lab_orders":
        return await handleGetPendingLabOrders();
      case "get_lab_order_details":
        return await handleGetLabOrderDetails(getString(args, "lab_order_id"));
      case "get_patient_lab_results":
        return await handleGetPatientLabResults(getString(args, "patient_id"), context.userRole);
      case "get_delayed_lab_orders":
        return await handleGetDelayedLabOrders(getInteger(args, "minutes_threshold", 120));
      case "get_lab_workload_summary":
        return await handleGetLabWorkloadSummary();
      case "draft_lab_result_entry":
        return handleDraftLabResultEntry(args);
      case "flag_abnormal_result":
        return handleFlagAbnormalResult(args);
      case "get_pending_prescriptions":
        return await handleGetPendingPrescriptions();
      case "get_medicine_stock":
        return await handleGetMedicineStock(getOptionalString(args, "filter"));
      case "get_prescription_details":
        return await handleGetPrescriptionDetails(getString(args, "medicine_order_id"));
      case "get_low_stock_medicines":
        return await handleGetMedicineStock("low_stock");
      case "get_expired_medicines":
        return await handleGetMedicineStock("expired");
      case "get_expiring_batches":
        return await handleGetExpiringBatches(getInteger(args, "days", 30));
      case "suggest_available_alternatives":
        return await handleSuggestAvailableAlternatives(args);
      case "draft_dispense_action":
        return await handleDraftDispenseAction(args);
      case "create_restock_request_draft":
        return handleCreateRestockRequestDraft(args);
      case "get_dashboard_counters":
        return await handleGetDashboardCounters();
      case "get_department_workload":
        return await handleGetDepartmentWorkload();
      case "get_audit_logs":
        return await handleGetAuditLogs(getInteger(args, "limit", 20));
      case "get_leave_requests":
        return await handleGetLeaveRequests(getOptionalString(args, "status"));
      case "get_today_operational_summary":
        return await handleGetTodayOperationalSummary();
      case "get_visits_by_status":
        return await handleGetVisitsByStatus(getOptionalString(args, "date"));
      case "get_audit_summary":
        return await handleGetAuditSummary(getInteger(args, "limit", 100));
      case "get_my_visits":
        return await handleGetMyVisits(context);
      case "get_my_lab_results":
        return await handleGetMyLabResults(context);
      case "get_my_prescriptions":
        return await handleGetMyPrescriptions(context);
      case "get_my_appointment_requests":
        return await handleGetMyAppointmentRequests(context);
      case "get_my_visit_status":
        return await handleGetMyVisitStatus(context);
      case "get_clinic_faq":
        return handleGetClinicFaq(getOptionalString(args, "topic"));
      case "get_lab_preparation_instructions":
        return handleGetLabPreparationInstructions(getOptionalString(args, "test_name"));
      default:
        return fail(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool execution failed";
    console.error(`[Agent Tool Error] ${toolName}:`, message);
    return fail(message);
  }
}

async function handleSearchPatients(query: string): Promise<ToolResult> {
  if (!query) return fail("Search query is required");
  const supabase = await createClient();
  const term = `%${query}%`;
  const { data, error } = await supabase
    .from("patients")
    .select("id,full_name,student_id,mrn,gender,birth_date,phone,status,created_at")
    .or(`full_name.ilike.${term},mrn.ilike.${term},student_id.ilike.${term}`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return fail(error.message);
  return ok({ patients: data, count: data?.length ?? 0 });
}

async function handleGetPatientProfile(patientId: string): Promise<ToolResult> {
  if (!patientId) return fail("patient_id is required");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .select("id,full_name,student_id,mrn,gender,birth_date,phone,emergency_phone,blood_type,address,dorm_info,nationality,status,created_at,updated_at,departments(name)")
    .eq("id", patientId)
    .maybeSingle();

  if (error) return fail(error.message);
  if (!data) return fail("Patient not found");
  return ok({ patient: data });
}

async function handleGetTodayVisits(status?: string): Promise<ToolResult> {
  const range = dayRange();
  return handleVisitListForRange(range.start, range.end, status);
}

async function handleVisitListForRange(start: string, end: string, status?: string): Promise<ToolResult> {
  const supabase = await createClient();
  let query = supabase
    .from("visits")
    .select("id,visit_code,status,priority,chief_complaint,created_at,patients(full_name,mrn),doctor:profiles!visits_doctor_id_fkey(full_name)")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false });

  if (status) {
    if (!isOneOf(status, VISIT_STATUSES)) return fail(`Invalid visit status: ${status}`);
    query = query.eq("status", status);
  }

  const { data, error } = await query.limit(100);
  if (error) return fail(error.message);

  return ok({
    visits: data,
    summary: summarizeByStatus(data ?? [], VISIT_STATUSES),
    high_priority_count: data?.filter((visit) => visit.priority === "high" || visit.priority === "urgent").length ?? 0,
  });
}

async function handleGetVisitDetails(visitId: string): Promise<ToolResult> {
  if (!visitId) return fail("visit_id is required");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visits")
    .select("id,visit_code,status,priority,chief_complaint,symptoms,diagnosis,disease,notes,doctor_instructions,created_at,started_at,completed_at,patients(full_name,mrn,student_id,phone),doctor:profiles!visits_doctor_id_fkey(full_name,email)")
    .eq("id", visitId)
    .maybeSingle();

  if (error) return fail(error.message);
  if (!data) return fail("Visit not found");
  return ok({ visit: data });
}

async function handleGetPatientVisits(patientId: string): Promise<ToolResult> {
  if (!patientId) return fail("patient_id is required");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visits")
    .select("id,visit_code,status,priority,chief_complaint,diagnosis,disease,created_at,completed_at,doctor:profiles!visits_doctor_id_fkey(full_name)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return fail(error.message);
  return ok({ visits: data, count: data?.length ?? 0 });
}

async function handleGetOpenVisit(patientId: string): Promise<ToolResult> {
  if (!patientId) return fail("patient_id is required");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visits")
    .select("id,visit_code,status,priority,chief_complaint,created_at,started_at,doctor:profiles!visits_doctor_id_fkey(full_name,email)")
    .eq("patient_id", patientId)
    .in("status", ACTIVE_VISIT_STATUSES)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return fail(error.message);
  return ok({ open_visits: data, count: data?.length ?? 0, has_open_visit: (data?.length ?? 0) > 0 });
}

async function handleGetQueueStatus(status?: string): Promise<ToolResult> {
  const today = await handleGetTodayVisits(status);
  if (!today.success) return today;
  const data = asRecord(today.data);
  const visits = Array.isArray(data?.visits) ? data.visits : [];
  return ok({
    summary: data?.summary,
    high_priority_count: data?.high_priority_count ?? 0,
    active_count: visits.filter((visit) => {
      const row = asRecord(visit);
      return typeof row?.status === "string" && (ACTIVE_VISIT_STATUSES as readonly string[]).includes(row.status);
    }).length,
    recent_queue: visits.slice(0, 15),
  });
}

async function handleGetPendingItemsForPatient(patientId: string): Promise<ToolResult> {
  if (!patientId) return fail("patient_id is required");
  const supabase = await createClient();
  const [labOrders, medicineOrders, appointments] = await Promise.all([
    supabase
      .from("lab_orders")
      .select("id,visit_id,status,doctor_notes,created_at,doctor:profiles!lab_orders_doctor_id_fkey(full_name)")
      .eq("patient_id", patientId)
      .in("status", ACTIVE_LAB_ORDER_STATUSES)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("medicine_orders")
      .select("id,visit_id,status,doctor_notes,created_at,doctor:profiles!medicine_orders_doctor_id_fkey(full_name)")
      .eq("patient_id", patientId)
      .in("status", ACTIVE_MEDICINE_ORDER_STATUSES)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("appointment_requests")
      .select("id,preferred_date,reason,status,created_at,requested_department:departments!appointment_requests_requested_department_id_fkey(name)")
      .eq("patient_id", patientId)
      .in("status", PENDING_APPOINTMENT_STATUSES)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const error = labOrders.error ?? medicineOrders.error ?? appointments.error;
  if (error) return fail(error.message);
  return ok({
    lab_orders: labOrders.data ?? [],
    medicine_orders: medicineOrders.data ?? [],
    appointment_requests: appointments.data ?? [],
    counts: {
      lab_orders: labOrders.data?.length ?? 0,
      medicine_orders: medicineOrders.data?.length ?? 0,
      appointment_requests: appointments.data?.length ?? 0,
    },
  });
}

function handleCreatePatientDraft(args: Record<string, unknown>): ToolResult {
  const fullName = getString(args, "full_name");
  if (!fullName) return fail("full_name is required");
  return draft("create_patient", {
    full_name: fullName,
    student_id: getOptionalString(args, "student_id"),
    mrn: getOptionalString(args, "mrn"),
    phone: getOptionalString(args, "phone"),
    gender: getOptionalString(args, "gender"),
    birth_date: getOptionalString(args, "birth_date"),
    department_id: getOptionalString(args, "department_id"),
  });
}

function handleCreateVisitDraft(args: Record<string, unknown>): ToolResult {
  const patientId = getString(args, "patient_id");
  const doctorId = getString(args, "doctor_id");
  const chiefComplaint = getString(args, "chief_complaint");
  const priorityArg = getOptionalString(args, "priority") ?? "normal";
  const priority = isOneOf(priorityArg, VISIT_PRIORITIES) ? priorityArg : "normal";
  if (!patientId || !doctorId || !chiefComplaint) return fail("patient_id, doctor_id, and chief_complaint are required");
  return draft("create_visit", {
    patient_id: patientId,
    doctor_id: doctorId,
    chief_complaint: chiefComplaint,
    priority,
    notes: getOptionalString(args, "notes"),
  });
}

async function handleGetPatientSummary(patientId: string): Promise<ToolResult> {
  if (!patientId) return fail("patient_id is required");
  const [profile, openVisit, visits, labs, medications, pendingItems] = await Promise.all([
    handleGetPatientProfile(patientId),
    handleGetOpenVisit(patientId),
    handleGetPatientVisits(patientId),
    handleGetPatientLabResults(patientId, "doctor"),
    handleGetMedicationHistory(patientId),
    handleGetPendingItemsForPatient(patientId),
  ]);

  const firstError = [profile, openVisit, visits, labs, medications, pendingItems].find((result) => !result.success);
  if (firstError) return firstError;
  return ok({
    profile: asRecord(profile.data)?.patient,
    open_visit: openVisit.data,
    recent_visits: visits.data,
    lab_results: labs.data,
    medication_history: medications.data,
    pending_items: pendingItems.data,
  });
}

async function handleGetPreviousDiagnoses(patientId: string): Promise<ToolResult> {
  if (!patientId) return fail("patient_id is required");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visits")
    .select("id,visit_code,diagnosis,disease,symptoms,notes,doctor_instructions,created_at,completed_at,doctor:profiles!visits_doctor_id_fkey(full_name)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return fail(error.message);
  const diagnoses = (data ?? []).filter((visit) => Boolean(visit.diagnosis || visit.disease || visit.notes || visit.doctor_instructions));
  return ok({ diagnoses, count: diagnoses.length });
}

async function handleGetMedicationHistory(patientId: string): Promise<ToolResult> {
  if (!patientId) return fail("patient_id is required");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicine_orders")
    .select("id,visit_id,status,doctor_notes,created_at,completed_at,doctor:profiles!medicine_orders_doctor_id_fkey(full_name),medicine_order_items(id,medicine_name_id,requested_quantity,dispensed_quantity,dosage_instructions,status,dispensed_at,medicine_names(name,category))")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return fail(error.message);
  return ok({ medication_history: data, count: data?.length ?? 0 });
}

async function handleGetPendingLabResults(patientId?: string): Promise<ToolResult> {
  const supabase = await createClient();
  let query = supabase
    .from("lab_order_items")
    .select("id,lab_order_id,result_value,result_notes,status,visible_to_patient,entered_at,reviewed_at,lab_tests(name,code,unit,normal_range),lab_orders!inner(patient_id,visit_id,patients(full_name,mrn),doctor:profiles!lab_orders_doctor_id_fkey(full_name))")
    .in("status", PENDING_LAB_RESULT_STATUSES)
    .order("created_at", { ascending: false });

  if (patientId) {
    query = query.eq("lab_orders.patient_id", patientId);
  }

  const { data, error } = await query.limit(50);
  if (error) return fail(error.message);
  return ok({ pending_lab_results: data, count: data?.length ?? 0 });
}

function handleDraftDiagnosis(args: Record<string, unknown>): ToolResult {
  const visitId = getString(args, "visit_id");
  const diagnosis = getString(args, "diagnosis");
  if (!visitId || !diagnosis) return fail("visit_id and diagnosis are required");
  return draft("diagnosis", {
    visit_id: visitId,
    diagnosis,
    disease: getOptionalString(args, "disease"),
    symptoms: getOptionalString(args, "symptoms"),
    notes: getOptionalString(args, "notes"),
    instructions: getOptionalString(args, "instructions"),
  });
}

function handleDraftLabOrder(args: Record<string, unknown>): ToolResult {
  const visitId = getString(args, "visit_id");
  if (!visitId) return fail("visit_id is required");
  return draft("lab_order", {
    visit_id: visitId,
    lab_test_ids: getStringArray(args, "lab_test_ids"),
    test_names: getStringArray(args, "test_names"),
    reason: getOptionalString(args, "reason"),
  });
}

function handleDraftPrescription(args: Record<string, unknown>): ToolResult {
  const visitId = getString(args, "visit_id");
  const medicines = Array.isArray(args.medicines) ? args.medicines : [];
  if (!visitId || medicines.length === 0) return fail("visit_id and at least one medicine item are required");
  return draft("prescription", {
    visit_id: visitId,
    medicines,
    doctor_notes: getOptionalString(args, "doctor_notes"),
  });
}

function handlePrepareVisitCompletionNotes(args: Record<string, unknown>): ToolResult {
  const visitId = getString(args, "visit_id");
  const summary = getString(args, "summary");
  if (!visitId || !summary) return fail("visit_id and summary are required");
  return draft("visit_completion_notes", {
    visit_id: visitId,
    summary,
    follow_up: getOptionalString(args, "follow_up"),
  });
}

async function handleGetPendingLabOrders(): Promise<ToolResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lab_orders")
    .select("id,visit_id,status,doctor_notes,created_at,patients(full_name,mrn),doctor:profiles!lab_orders_doctor_id_fkey(full_name)")
    .eq("status", "ordered")
    .order("created_at", { ascending: true })
    .limit(30);

  if (error) return fail(error.message);
  return ok({ pending_orders: data, count: data?.length ?? 0 });
}

async function handleGetLabOrderDetails(labOrderId: string): Promise<ToolResult> {
  if (!labOrderId) return fail("lab_order_id is required");
  const supabase = await createClient();
  const { data: order, error: orderErr } = await supabase
    .from("lab_orders")
    .select("id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,completed_at,patients(full_name,mrn),doctor:profiles!lab_orders_doctor_id_fkey(full_name)")
    .eq("id", labOrderId)
    .maybeSingle();

  if (orderErr) return fail(orderErr.message);
  if (!order) return fail("Lab order not found");

  const { data: items, error: itemsErr } = await supabase
    .from("lab_order_items")
    .select("id,lab_test_id,result_value,result_notes,status,visible_to_patient,entered_at,reviewed_at,lab_tests(name,code,unit,normal_range)")
    .eq("lab_order_id", labOrderId);

  if (itemsErr) return fail(itemsErr.message);
  return ok({ order, items });
}

async function handleGetPatientLabResults(patientId: string, userRole: string): Promise<ToolResult> {
  if (!patientId) return fail("patient_id is required");
  const supabase = await createClient();
  let query = supabase
    .from("lab_order_items")
    .select("id,lab_order_id,result_value,result_notes,status,visible_to_patient,entered_at,reviewed_at,lab_tests(name,code,unit,normal_range),lab_orders!inner(patient_id,visit_id,doctor:profiles!lab_orders_doctor_id_fkey(full_name))")
    .eq("lab_orders.patient_id", patientId)
    .order("entered_at", { ascending: false });

  if (userRole === "patient") {
    query = query.eq("visible_to_patient", true);
  }

  const { data, error } = await query.limit(50);
  if (error) return fail(error.message);
  return ok({ lab_results: data, count: data?.length ?? 0 });
}

async function handleGetDelayedLabOrders(minutesThreshold: number): Promise<ToolResult> {
  const minutes = clamp(minutesThreshold, 15, 14_400);
  const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lab_orders")
    .select("id,visit_id,status,doctor_notes,created_at,patients(full_name,mrn),doctor:profiles!lab_orders_doctor_id_fkey(full_name)")
    .in("status", ACTIVE_LAB_ORDER_STATUSES)
    .lte("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) return fail(error.message);
  return ok({
    delayed_orders: (data ?? []).map((order) => ({
      ...order,
      delay_minutes: minutesBetween(order.created_at, new Date().toISOString()),
    })),
    count: data?.length ?? 0,
    threshold_minutes: minutes,
  });
}

async function handleGetLabWorkloadSummary(): Promise<ToolResult> {
  const supabase = await createClient();
  const order_status_counts: Record<string, number> = {};
  const result_status_counts: Record<string, number> = {};

  for (const status of LAB_ORDER_STATUSES) {
    const { count, error } = await supabase.from("lab_orders").select("id", { count: "exact", head: true }).eq("status", status);
    if (error) return fail(error.message);
    order_status_counts[status] = count ?? 0;
  }
  for (const status of LAB_RESULT_STATUSES) {
    const { count, error } = await supabase.from("lab_order_items").select("id", { count: "exact", head: true }).eq("status", status);
    if (error) return fail(error.message);
    result_status_counts[status] = count ?? 0;
  }

  return ok({
    order_status_counts,
    result_status_counts,
    active_orders: ACTIVE_LAB_ORDER_STATUSES.reduce((total, status) => total + (order_status_counts[status] ?? 0), 0),
    pending_result_items: PENDING_LAB_RESULT_STATUSES.reduce((total, status) => total + (result_status_counts[status] ?? 0), 0),
  });
}

function handleDraftLabResultEntry(args: Record<string, unknown>): ToolResult {
  const labResultId = getString(args, "lab_result_id");
  const resultValue = getString(args, "result_value");
  if (!labResultId || !resultValue) return fail("lab_result_id and result_value are required");
  return draft("lab_result_entry", {
    lab_result_id: labResultId,
    result_value: resultValue,
    result_notes: getOptionalString(args, "result_notes"),
  });
}

function handleFlagAbnormalResult(args: Record<string, unknown>): ToolResult {
  const resultValue = getString(args, "result_value");
  const normalRange = getString(args, "normal_range");
  if (!resultValue || !normalRange) return fail("result_value and normal_range are required");
  const analysis = analyzeSimpleRange(resultValue, normalRange);
  return ok({
    lab_test_name: getOptionalString(args, "lab_test_name"),
    result_value: resultValue,
    normal_range: normalRange,
    ...analysis,
    safety_note: "This is a screening flag only. A doctor must review abnormal or unclear results.",
  });
}

async function handleGetPendingPrescriptions(): Promise<ToolResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicine_orders")
    .select("id,visit_id,status,doctor_notes,created_at,patients(full_name,mrn),doctor:profiles!medicine_orders_doctor_id_fkey(full_name)")
    .eq("status", "ordered")
    .order("created_at", { ascending: true })
    .limit(30);

  if (error) return fail(error.message);
  return ok({ pending_prescriptions: data, count: data?.length ?? 0 });
}

async function handleGetMedicineStock(filter?: string): Promise<ToolResult> {
  const today = new Date().toISOString().split("T")[0] ?? "";
  const supabase = await createClient();
  let query = supabase
    .from("medicine_batches")
    .select("id,medicine_name_id,batch_number,quantity,unit_price,expiry_date,status,created_at,medicine_names(name,category,description)")
    .order("expiry_date", { ascending: true });

  if (filter === "low_stock") {
    query = query.lte("quantity", 10).eq("status", "in_stock");
  } else if (filter === "expired") {
    query = query.lt("expiry_date", today);
  } else if (filter === "expiring_soon") {
    const thirtyDays = dateAfterDays(30);
    query = query.lte("expiry_date", thirtyDays).gte("expiry_date", today);
  } else if (filter && filter !== "all") {
    return fail(`Invalid stock filter: ${filter}`);
  }

  const { data, error } = await query.limit(50);
  if (error) return fail(error.message);
  return ok(stockResponse(data ?? [], today));
}

async function handleGetExpiringBatches(days: number): Promise<ToolResult> {
  const safeDays = clamp(days, 1, 365);
  const today = new Date().toISOString().split("T")[0] ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicine_batches")
    .select("id,medicine_name_id,batch_number,quantity,unit_price,expiry_date,status,created_at,medicine_names(name,category,description)")
    .gte("expiry_date", today)
    .lte("expiry_date", dateAfterDays(safeDays))
    .order("expiry_date", { ascending: true })
    .limit(50);

  if (error) return fail(error.message);
  return ok({ ...stockResponse(data ?? [], today), days: safeDays });
}

async function handleGetPrescriptionDetails(medicineOrderId: string): Promise<ToolResult> {
  if (!medicineOrderId) return fail("medicine_order_id is required");
  const supabase = await createClient();
  const { data: order, error: orderErr } = await supabase
    .from("medicine_orders")
    .select("id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,completed_at,patients(full_name,mrn),doctor:profiles!medicine_orders_doctor_id_fkey(full_name)")
    .eq("id", medicineOrderId)
    .maybeSingle();

  if (orderErr) return fail(orderErr.message);
  if (!order) return fail("Medicine order not found");

  const { data: items, error: itemsErr } = await supabase
    .from("medicine_order_items")
    .select("id,medicine_name_id,requested_quantity,dispensed_quantity,dosage_instructions,status,dispensed_at,medicine_names(name,category)")
    .eq("medicine_order_id", medicineOrderId);

  if (itemsErr) return fail(itemsErr.message);
  return ok({ order, items });
}

async function handleSuggestAvailableAlternatives(args: Record<string, unknown>): Promise<ToolResult> {
  const medicineName = getOptionalString(args, "medicine_name")?.toLowerCase();
  const category = getOptionalString(args, "category")?.toLowerCase();
  const today = new Date().toISOString().split("T")[0] ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicine_batches")
    .select("id,medicine_name_id,quantity,expiry_date,status,medicine_names(name,category,description)")
    .eq("status", "in_stock")
    .gt("quantity", 0)
    .limit(100);

  if (error) return fail(error.message);
  const grouped = new Map<string, { medicine_name_id: string; name: string; category: string | null; total_quantity: number; batches: number }>();
  for (const batch of data ?? []) {
    if (batch.expiry_date && batch.expiry_date < today) continue;
    const medicine = relationObject(batch.medicine_names);
    const name = stringValue(medicine?.name);
    const medCategory = stringValue(medicine?.category);
    if (!name) continue;
    const nameMatches = medicineName ? name.toLowerCase().includes(medicineName) : false;
    const categoryMatches = category ? medCategory?.toLowerCase() === category : false;
    if ((medicineName || category) && !nameMatches && !categoryMatches) continue;

    const current = grouped.get(batch.medicine_name_id) ?? {
      medicine_name_id: batch.medicine_name_id,
      name,
      category: medCategory,
      total_quantity: 0,
      batches: 0,
    };
    current.total_quantity += batch.quantity;
    current.batches += 1;
    grouped.set(batch.medicine_name_id, current);
  }

  return ok({ alternatives: Array.from(grouped.values()).sort((a, b) => b.total_quantity - a.total_quantity).slice(0, 10) });
}

async function handleDraftDispenseAction(args: Record<string, unknown>): Promise<ToolResult> {
  const itemId = getString(args, "prescription_item_id");
  const quantity = getInteger(args, "quantity", 0);
  if (!itemId || quantity <= 0) return fail("prescription_item_id and a positive quantity are required");

  const supabase = await createClient();
  const { data: item, error: itemError } = await supabase
    .from("medicine_order_items")
    .select("id,medicine_name_id,requested_quantity,dispensed_quantity,status,medicine_names(name,category)")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError) return fail(itemError.message);
  if (!item) return fail("Prescription item not found");

  const today = new Date().toISOString().split("T")[0] ?? "";
  const { data: batches, error: stockError } = await supabase
    .from("medicine_batches")
    .select("id,batch_number,quantity,expiry_date,status")
    .eq("medicine_name_id", item.medicine_name_id)
    .eq("status", "in_stock")
    .gt("quantity", 0)
    .order("expiry_date", { ascending: true });

  if (stockError) return fail(stockError.message);
  const availableBatches = (batches ?? []).filter((batch) => !batch.expiry_date || batch.expiry_date >= today);
  const availableQuantity = availableBatches.reduce((total, batch) => total + batch.quantity, 0);
  const remainingRequested = Math.max(item.requested_quantity - item.dispensed_quantity, 0);
  const feasible = quantity <= availableQuantity && quantity <= remainingRequested;

  return draft("dispense_medicine", {
    prescription_item_id: itemId,
    quantity,
    medicine: item.medicine_names,
    requested_quantity: item.requested_quantity,
    already_dispensed: item.dispensed_quantity,
    remaining_requested: remainingRequested,
    available_quantity: availableQuantity,
    feasible,
    stock_batches_considered: availableBatches.slice(0, 10),
  });
}

function handleCreateRestockRequestDraft(args: Record<string, unknown>): ToolResult {
  const medicineNameId = getString(args, "medicine_name_id");
  const requestedQuantity = getInteger(args, "requested_quantity", 0);
  if (!medicineNameId || requestedQuantity <= 0) return fail("medicine_name_id and a positive requested_quantity are required");
  return draft("restock_request", {
    medicine_name_id: medicineNameId,
    requested_quantity: requestedQuantity,
    reason: getOptionalString(args, "reason"),
  });
}

async function handleGetDashboardCounters(): Promise<ToolResult> {
  const today = new Date().toISOString().split("T")[0] ?? "";
  const supabase = await createClient();
  const [employees, doctors, patients, todayVisits, pendingLab, pendingRx, lowStock, expiredStock, leaveReq] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "doctor"),
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase.from("visits").select("id", { count: "exact", head: true }).gte("created_at", `${today}T00:00:00`),
    supabase.from("lab_orders").select("id", { count: "exact", head: true }).in("status", ACTIVE_LAB_ORDER_STATUSES),
    supabase.from("medicine_orders").select("id", { count: "exact", head: true }).in("status", ACTIVE_MEDICINE_ORDER_STATUSES),
    supabase.from("medicine_batches").select("id", { count: "exact", head: true }).lte("quantity", 10).eq("status", "in_stock"),
    supabase.from("medicine_batches").select("id", { count: "exact", head: true }).lt("expiry_date", today),
    supabase.from("leave_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const error = employees.error ?? doctors.error ?? patients.error ?? todayVisits.error ?? pendingLab.error ?? pendingRx.error ?? lowStock.error ?? expiredStock.error ?? leaveReq.error;
  if (error) return fail(error.message);
  return ok({
    total_employees: employees.count ?? 0,
    total_doctors: doctors.count ?? 0,
    total_patients: patients.count ?? 0,
    visits_today: todayVisits.count ?? 0,
    pending_lab_orders: pendingLab.count ?? 0,
    pending_prescriptions: pendingRx.count ?? 0,
    low_stock_medicines: lowStock.count ?? 0,
    expired_medicines: expiredStock.count ?? 0,
    pending_leave_requests: leaveReq.count ?? 0,
  });
}

async function handleGetDepartmentWorkload(): Promise<ToolResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id,name,status")
    .order("name", { ascending: true });

  if (error) return fail(error.message);
  return ok({ departments: data, count: data?.length ?? 0 });
}

async function handleGetAuditLogs(limit?: number): Promise<ToolResult> {
  const cap = clamp(limit ?? 20, 1, 50);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id,actor_id,action,entity_type,entity_id,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(cap);

  if (error) return fail(error.message);
  return ok({ audit_logs: data, count: data?.length ?? 0, limit: cap });
}

async function handleGetLeaveRequests(status?: string): Promise<ToolResult> {
  const supabase = await createClient();
  let query = supabase
    .from("leave_requests")
    .select("id,leave_type,start_date,end_date,reason,status,admin_comment,created_at,employee:profiles!leave_requests_employee_profile_id_fkey(full_name,email)")
    .order("created_at", { ascending: false });

  if (status) {
    if (!isOneOf(status, LEAVE_REQUEST_STATUSES)) return fail(`Invalid leave request status: ${status}`);
    query = query.eq("status", status);
  }

  const { data, error } = await query.limit(20);
  if (error) return fail(error.message);
  return ok({ leave_requests: data, count: data?.length ?? 0 });
}

async function handleGetTodayOperationalSummary(): Promise<ToolResult> {
  const [counters, queue, delayedLabs, pendingPrescriptions, lowStock, expired, leaveRequests] = await Promise.all([
    handleGetDashboardCounters(),
    handleGetQueueStatus(),
    handleGetDelayedLabOrders(120),
    handleGetPendingPrescriptions(),
    handleGetMedicineStock("low_stock"),
    handleGetMedicineStock("expired"),
    handleGetLeaveRequests("pending"),
  ]);

  const firstError = [counters, queue, delayedLabs, pendingPrescriptions, lowStock, expired, leaveRequests].find((result) => !result.success);
  if (firstError) return firstError;
  return ok({
    counters: counters.data,
    queue: queue.data,
    delayed_labs: delayedLabs.data,
    pending_prescriptions: pendingPrescriptions.data,
    low_stock: lowStock.data,
    expired_medicines: expired.data,
    pending_leave_requests: leaveRequests.data,
  });
}

async function handleGetVisitsByStatus(date?: string): Promise<ToolResult> {
  const targetDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().split("T")[0] ?? "";
  const result = await handleVisitListForRange(`${targetDate}T00:00:00`, `${targetDate}T23:59:59`);
  if (!result.success) return result;
  const data = asRecord(result.data);
  return ok({
    date: targetDate,
    summary: data?.summary,
    high_priority_count: data?.high_priority_count,
    recent_visits: Array.isArray(data?.visits) ? data.visits.slice(0, 25) : [],
  });
}

async function handleGetAuditSummary(limit: number): Promise<ToolResult> {
  const logs = await handleGetAuditLogs(clamp(limit, 1, 200));
  if (!logs.success) return logs;
  const records = Array.isArray(asRecord(logs.data)?.audit_logs) ? asRecord(logs.data)?.audit_logs as unknown[] : [];
  return ok({
    limit: asRecord(logs.data)?.limit,
    total: records.length,
    by_action: countRecords(records, "action"),
    by_entity_type: countRecords(records, "entity_type"),
    recent: records.slice(0, 10),
  });
}

async function resolvePatientId(context: ToolContext): Promise<string | null> {
  if (context.patientId) return context.patientId;
  if (!context.userId) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", context.userId)
    .maybeSingle();
  return data?.id ?? null;
}

async function handleGetMyVisits(context: ToolContext): Promise<ToolResult> {
  const patientId = await resolvePatientId(context);
  if (!patientId) return fail("No patient profile linked to this account");
  return handleGetPatientVisits(patientId);
}

async function handleGetMyLabResults(context: ToolContext): Promise<ToolResult> {
  const patientId = await resolvePatientId(context);
  if (!patientId) return fail("No patient profile linked to this account");
  return handleGetPatientLabResults(patientId, "patient");
}

async function handleGetMyPrescriptions(context: ToolContext): Promise<ToolResult> {
  const patientId = await resolvePatientId(context);
  if (!patientId) return fail("No patient profile linked to this account");
  return handleGetMedicationHistory(patientId);
}

async function handleGetMyAppointmentRequests(context: ToolContext): Promise<ToolResult> {
  const patientId = await resolvePatientId(context);
  if (!patientId) return fail("No patient profile linked to this account");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointment_requests")
    .select("id,preferred_date,reason,status,admin_comment,reviewed_at,created_at,requested_department:departments!appointment_requests_requested_department_id_fkey(name)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return fail(error.message);
  return ok({ appointment_requests: data, count: data?.length ?? 0 });
}

async function handleGetMyVisitStatus(context: ToolContext): Promise<ToolResult> {
  const patientId = await resolvePatientId(context);
  if (!patientId) return fail("No patient profile linked to this account");
  const supabase = await createClient();
  const [openVisits, latestVisit] = await Promise.all([
    supabase
      .from("visits")
      .select("id,visit_code,status,priority,chief_complaint,created_at,started_at,completed_at,doctor:profiles!visits_doctor_id_fkey(full_name)")
      .eq("patient_id", patientId)
      .in("status", ACTIVE_VISIT_STATUSES)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("visits")
      .select("id,visit_code,status,priority,chief_complaint,created_at,started_at,completed_at,doctor:profiles!visits_doctor_id_fkey(full_name)")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const error = openVisits.error ?? latestVisit.error;
  if (error) return fail(error.message);
  return ok({
    open_visits: openVisits.data ?? [],
    latest_visit: latestVisit.data?.[0] ?? null,
    has_open_visit: (openVisits.data?.length ?? 0) > 0,
  });
}

function handleGetClinicFaq(topic?: string): ToolResult {
  const faq = {
    appointments: "You can request an appointment from the patient portal. Reception reviews the request and updates its status.",
    visits: "Open visits show the current clinic workflow status, such as queued, in progress, waiting for lab, or waiting for pharmacy.",
    lab_results: "Patients can see lab results only after they are approved for patient visibility.",
    prescriptions: "Prescriptions show medicine items and dispensing status after a doctor creates the order.",
    emergency: "For chest pain, severe symptoms, breathing difficulty, fainting, or emergencies, contact local emergency services immediately.",
    contact: "Use the clinic contact channels shown in the portal or speak with reception for account and appointment questions.",
    general: "HealTech helps you follow visits, lab results, prescriptions, and appointment requests from your portal.",
  };
  const key = topic && topic in faq ? topic as keyof typeof faq : "general";
  return ok({ topic: key, answer: faq[key], faq });
}

function handleGetLabPreparationInstructions(testName?: string): ToolResult {
  const name = testName?.toLowerCase() ?? "";
  const instructions = [
    "Follow any instructions your doctor or lab staff gave you for this specific test.",
    "Bring your patient ID or clinic details if required by reception.",
    "Ask lab staff before the test if you are unsure about fasting, medication timing, or sample collection.",
  ];
  if (name.includes("glucose") || name.includes("lipid") || name.includes("fast")) {
    instructions.unshift("Some glucose or lipid tests may require fasting. Confirm the exact fasting period with clinic staff.");
  }
  if (name.includes("urine")) {
    instructions.unshift("For urine tests, use the collection container and timing instructions provided by lab staff.");
  }
  return ok({ test_name: testName ?? null, instructions });
}

function ok(data: unknown): ToolResult {
  return { success: true, data };
}

function fail(error: string): ToolResult {
  return { success: false, data: null, error };
}

function draft(actionType: string, draftData: Record<string, unknown>): ToolResult {
  return ok({
    action_type: actionType,
    mode: "draft_only",
    requires_approval: true,
    draft: draftData,
    safety_note: "No database changes were made. A human user must review and submit this through the approved HealTech workflow.",
  });
}

function getString(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(args: Record<string, unknown>, key: string): string | undefined {
  const value = getString(args, key);
  return value || undefined;
}

function getInteger(args: Record<string, unknown>, key: string, fallback: number): number {
  const value = args[key];
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Math.trunc(Number(value));
  return fallback;
}

function getStringArray(args: Record<string, unknown>, key: string): string[] {
  const value = args[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
}

function isOneOf<T extends string>(value: string, values: readonly T[]): value is T {
  return (values as readonly string[]).includes(value);
}

function dayRange(date = new Date().toISOString().split("T")[0] ?? "") {
  return { start: `${date}T00:00:00`, end: `${date}T23:59:59` };
}

function summarizeByStatus<T extends string>(rows: Array<{ status: T }>, statuses: readonly T[]) {
  const summary: Record<string, number> = { total: rows.length };
  for (const status of statuses) {
    summary[status] = rows.filter((row) => row.status === status).length;
  }
  return summary;
}

function stockResponse(
  batches: Array<{ quantity: number; expiry_date: string | null; status: MedicineBatchStatus | string }>,
  today: string,
) {
  return {
    batches,
    count: batches.length,
    low_stock_count: batches.filter((batch) => batch.quantity <= 10 && batch.status === "in_stock").length,
    expired_count: batches.filter((batch) => batch.expiry_date && batch.expiry_date < today).length,
    available_quantity: batches
      .filter((batch) => batch.status === "in_stock" && (!batch.expiry_date || batch.expiry_date >= today))
      .reduce((total, batch) => total + batch.quantity, 0),
  };
}

function dateAfterDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0] ?? "";
}

function minutesBetween(start: string, end: string) {
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function relationObject(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) return asRecord(value[0]);
  return asRecord(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function countRecords(records: unknown[], key: string) {
  const counts: Record<string, number> = {};
  for (const record of records) {
    const value = asRecord(record)?.[key];
    if (typeof value !== "string" || !value) continue;
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

function analyzeSimpleRange(resultValue: string, normalRange: string) {
  const value = firstNumber(resultValue);
  const range = parseSimpleRange(normalRange);
  if (value === null || !range) {
    return {
      flag: "review_required",
      needs_doctor_review: true,
      reason: "Could not parse the numeric result or normal range reliably.",
    };
  }

  if (range.min !== null && value < range.min) {
    return { flag: "below_range", needs_doctor_review: true, reason: `Value is below ${range.min}.` };
  }
  if (range.max !== null && value > range.max) {
    return { flag: "above_range", needs_doctor_review: true, reason: `Value is above ${range.max}.` };
  }
  return { flag: "within_range", needs_doctor_review: false, reason: "Value is within the parsed numeric range." };
}

function firstNumber(value: string): number | null {
  const match = value.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function parseSimpleRange(value: string): { min: number | null; max: number | null } | null {
  const normalized = value.replace(/[\u2013\u2014]/g, "-");
  const between = normalized.match(/(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)/);
  if (between) return { min: Number(between[1]), max: Number(between[2]) };
  const lessThan = normalized.match(/[<\u2264]\s*(-?\d+(?:\.\d+)?)/);
  if (lessThan) return { min: null, max: Number(lessThan[1]) };
  const greaterThan = normalized.match(/[>\u2265]\s*(-?\d+(?:\.\d+)?)/);
  if (greaterThan) return { min: Number(greaterThan[1]), max: null };
  return null;
}
