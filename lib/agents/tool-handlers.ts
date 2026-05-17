// ─── HealTech Agent Tool Handlers ───────────────────────────────────────────
// Server-side handlers that execute Supabase queries for AI tool calls.
// These run ONLY on the server (inside the API route).

import { createClient } from "@/lib/supabase/server";

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

// ─── Main Dispatcher ────────────────────────────────────────────────────────

export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  context: ToolContext,
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case "search_patients":
        return await handleSearchPatients(args.query as string);
      case "get_patient_profile":
        return await handleGetPatientProfile(args.patient_id as string);
      case "get_today_visits":
        return await handleGetTodayVisits(args.status as string | undefined);
      case "get_visit_details":
        return await handleGetVisitDetails(args.visit_id as string);
      case "get_patient_visits":
        return await handleGetPatientVisits(args.patient_id as string);
      case "get_pending_lab_orders":
        return await handleGetPendingLabOrders();
      case "get_lab_order_details":
        return await handleGetLabOrderDetails(args.lab_order_id as string);
      case "get_patient_lab_results":
        return await handleGetPatientLabResults(args.patient_id as string, context.userRole);
      case "get_pending_prescriptions":
        return await handleGetPendingPrescriptions();
      case "get_medicine_stock":
        return await handleGetMedicineStock(args.filter as string | undefined);
      case "get_prescription_details":
        return await handleGetPrescriptionDetails(args.medicine_order_id as string);
      case "get_dashboard_counters":
        return await handleGetDashboardCounters();
      case "get_department_workload":
        return await handleGetDepartmentWorkload();
      case "get_audit_logs":
        return await handleGetAuditLogs(args.limit as number | undefined);
      case "get_leave_requests":
        return await handleGetLeaveRequests(args.status as string | undefined);
      case "get_my_visits":
        return await handleGetMyVisits(context);
      case "get_my_lab_results":
        return await handleGetMyLabResults(context);
      case "get_my_prescriptions":
        return await handleGetMyPrescriptions(context);
      case "get_my_appointment_requests":
        return await handleGetMyAppointmentRequests(context);
      default:
        return { success: false, data: null, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool execution failed";
    console.error(`[Agent Tool Error] ${toolName}:`, message);
    return { success: false, data: null, error: message };
  }
}

// ─── Patient Tools ──────────────────────────────────────────────────────────

async function handleSearchPatients(query: string): Promise<ToolResult> {
  const supabase = await createClient();
  const term = `%${query}%`;
  const { data, error } = await supabase
    .from("patients")
    .select("id,full_name,student_id,mrn,gender,birth_date,phone,status,created_at")
    .or(`full_name.ilike.${term},mrn.ilike.${term},student_id.ilike.${term}`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return { success: false, data: null, error: error.message };
  return { success: true, data: { patients: data, count: data?.length ?? 0 } };
}

async function handleGetPatientProfile(patientId: string): Promise<ToolResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .select("id,full_name,student_id,mrn,gender,birth_date,phone,emergency_phone,blood_type,address,dorm_info,nationality,status,created_at,updated_at,departments(name)")
    .eq("id", patientId)
    .maybeSingle();

  if (error) return { success: false, data: null, error: error.message };
  if (!data) return { success: false, data: null, error: "Patient not found" };
  return { success: true, data: { patient: data } };
}

// ─── Visit Tools ────────────────────────────────────────────────────────────

async function handleGetTodayVisits(status?: string): Promise<ToolResult> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  let query = supabase
    .from("visits")
    .select("id,visit_code,status,priority,chief_complaint,created_at,patients(full_name,mrn),doctor:profiles!visits_doctor_id_fkey(full_name)")
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status as any);
  }

  const { data, error } = await query.limit(50);
  if (error) return { success: false, data: null, error: error.message };

  const summary = {
    total: data?.length ?? 0,
    queued: data?.filter((v) => v.status === "queued").length ?? 0,
    in_progress: data?.filter((v) => v.status === "in_progress").length ?? 0,
    completed: data?.filter((v) => v.status === "completed").length ?? 0,
  };

  return { success: true, data: { visits: data, summary } };
}

async function handleGetVisitDetails(visitId: string): Promise<ToolResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visits")
    .select("id,visit_code,status,priority,chief_complaint,symptoms,diagnosis,disease,doctor_instructions,created_at,completed_at,patients(full_name,mrn,student_id,phone),doctor:profiles!visits_doctor_id_fkey(full_name,email)")
    .eq("id", visitId)
    .maybeSingle();

  if (error) return { success: false, data: null, error: error.message };
  if (!data) return { success: false, data: null, error: "Visit not found" };
  return { success: true, data: { visit: data } };
}

async function handleGetPatientVisits(patientId: string): Promise<ToolResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visits")
    .select("id,visit_code,status,priority,chief_complaint,diagnosis,created_at,completed_at,doctor:profiles!visits_doctor_id_fkey(full_name)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return { success: false, data: null, error: error.message };
  return { success: true, data: { visits: data, count: data?.length ?? 0 } };
}

// ─── Lab Tools ──────────────────────────────────────────────────────────────

async function handleGetPendingLabOrders(): Promise<ToolResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lab_orders")
    .select("id,visit_id,status,doctor_notes,created_at,patients(full_name,mrn),doctor:profiles!lab_orders_doctor_id_fkey(full_name)")
    .eq("status", "ordered")
    .order("created_at", { ascending: true })
    .limit(30);

  if (error) return { success: false, data: null, error: error.message };
  return { success: true, data: { pending_orders: data, count: data?.length ?? 0 } };
}

async function handleGetLabOrderDetails(labOrderId: string): Promise<ToolResult> {
  const supabase = await createClient();
  const { data: order, error: orderErr } = await supabase
    .from("lab_orders")
    .select("id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,completed_at,patients(full_name,mrn),doctor:profiles!lab_orders_doctor_id_fkey(full_name)")
    .eq("id", labOrderId)
    .maybeSingle();

  if (orderErr) return { success: false, data: null, error: orderErr.message };
  if (!order) return { success: false, data: null, error: "Lab order not found" };

  const { data: items, error: itemsErr } = await supabase
    .from("lab_order_items")
    .select("id,lab_test_id,result_value,result_notes,status,visible_to_patient,entered_at,reviewed_at,lab_tests(name,code,unit,normal_range)")
    .eq("lab_order_id", labOrderId);

  if (itemsErr) return { success: false, data: null, error: itemsErr.message };
  return { success: true, data: { order, items } };
}

async function handleGetPatientLabResults(patientId: string, userRole: string): Promise<ToolResult> {
  const supabase = await createClient();
  let query = supabase
    .from("lab_order_items")
    .select("id,lab_order_id,result_value,result_notes,status,visible_to_patient,entered_at,reviewed_at,lab_tests(name,code,unit,normal_range),lab_orders!inner(patient_id,visit_id,doctor:profiles!lab_orders_doctor_id_fkey(full_name))")
    .eq("lab_orders.patient_id", patientId)
    .order("entered_at", { ascending: false });

  // Patients can only see results marked visible_to_patient
  if (userRole === "patient") {
    query = query.eq("visible_to_patient", true);
  }

  const { data, error } = await query.limit(50);
  if (error) return { success: false, data: null, error: error.message };
  return { success: true, data: { lab_results: data, count: data?.length ?? 0 } };
}

// ─── Pharmacy Tools ─────────────────────────────────────────────────────────

async function handleGetPendingPrescriptions(): Promise<ToolResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicine_orders")
    .select("id,visit_id,status,doctor_notes,created_at,patients(full_name,mrn),doctor:profiles!medicine_orders_doctor_id_fkey(full_name)")
    .eq("status", "ordered")
    .order("created_at", { ascending: true })
    .limit(30);

  if (error) return { success: false, data: null, error: error.message };
  return { success: true, data: { pending_prescriptions: data, count: data?.length ?? 0 } };
}

async function handleGetMedicineStock(filter?: string): Promise<ToolResult> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("medicine_batches")
    .select("id,batch_number,quantity,unit_price,expiry_date,status,created_at,medicine_names(name,category,description)")
    .order("expiry_date", { ascending: true });

  if (filter === "low_stock") {
    query = query.lte("quantity", 10).eq("status", "in_stock");
  } else if (filter === "expired") {
    query = query.lt("expiry_date", today);
  } else if (filter === "expiring_soon") {
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    query = query.lte("expiry_date", thirtyDays).gte("expiry_date", today);
  }

  const { data, error } = await query.limit(50);
  if (error) return { success: false, data: null, error: error.message };

  const lowStock = data?.filter((b) => b.quantity <= 10 && b.status === "in_stock").length ?? 0;
  const expired = data?.filter((b) => b.expiry_date && b.expiry_date < today).length ?? 0;

  return { success: true, data: { batches: data, count: data?.length ?? 0, low_stock_count: lowStock, expired_count: expired } };
}

async function handleGetPrescriptionDetails(medicineOrderId: string): Promise<ToolResult> {
  const supabase = await createClient();
  const { data: order, error: orderErr } = await supabase
    .from("medicine_orders")
    .select("id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,completed_at,patients(full_name,mrn),doctor:profiles!medicine_orders_doctor_id_fkey(full_name)")
    .eq("id", medicineOrderId)
    .maybeSingle();

  if (orderErr) return { success: false, data: null, error: orderErr.message };
  if (!order) return { success: false, data: null, error: "Medicine order not found" };

  const { data: items, error: itemsErr } = await supabase
    .from("medicine_order_items")
    .select("id,medicine_name_id,requested_quantity,dispensed_quantity,dosage_instructions,status,dispensed_at,medicine_names(name,category)")
    .eq("medicine_order_id", medicineOrderId);

  if (itemsErr) return { success: false, data: null, error: itemsErr.message };
  return { success: true, data: { order, items } };
}

// ─── Admin Tools ────────────────────────────────────────────────────────────

async function handleGetDashboardCounters(): Promise<ToolResult> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [employees, doctors, patients, todayVisits, pendingLab, pendingRx, lowStock, leaveReq] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }),
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("profiles.role", "doctor"),
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase.from("visits").select("id", { count: "exact", head: true }).gte("created_at", `${today}T00:00:00`),
    supabase.from("lab_orders").select("id", { count: "exact", head: true }).eq("status", "ordered"),
    supabase.from("medicine_orders").select("id", { count: "exact", head: true }).eq("status", "ordered"),
    supabase.from("medicine_batches").select("id", { count: "exact", head: true }).lte("quantity", 10).eq("status", "in_stock"),
    supabase.from("leave_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return {
    success: true,
    data: {
      total_employees: employees.count ?? 0,
      total_doctors: doctors.count ?? 0,
      total_patients: patients.count ?? 0,
      visits_today: todayVisits.count ?? 0,
      pending_lab_orders: pendingLab.count ?? 0,
      pending_prescriptions: pendingRx.count ?? 0,
      low_stock_medicines: lowStock.count ?? 0,
      pending_leave_requests: leaveReq.count ?? 0,
    },
  };
}

async function handleGetDepartmentWorkload(): Promise<ToolResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id,name,status");

  if (error) return { success: false, data: null, error: error.message };
  return { success: true, data: { departments: data } };
}

async function handleGetAuditLogs(limit?: number): Promise<ToolResult> {
  const supabase = await createClient();
  const cap = Math.min(limit ?? 20, 50);
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id,actor_id,action,entity_type,entity_id,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(cap);

  if (error) return { success: false, data: null, error: error.message };
  return { success: true, data: { audit_logs: data, count: data?.length ?? 0 } };
}

async function handleGetLeaveRequests(status?: string): Promise<ToolResult> {
  const supabase = await createClient();
  let query = supabase
    .from("leave_requests")
    .select("id,leave_type,start_date,end_date,reason,status,admin_comment,created_at,employee:profiles!leave_requests_employee_profile_id_fkey(full_name,email)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (status) {
    query = query.eq("status", status as any);
  }

  const { data, error } = await query;
  if (error) return { success: false, data: null, error: error.message };
  return { success: true, data: { leave_requests: data, count: data?.length ?? 0 } };
}

// ─── Patient Self-Service Tools ─────────────────────────────────────────────

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
  if (!patientId) return { success: false, data: null, error: "No patient profile linked to this account" };
  return handleGetPatientVisits(patientId);
}

async function handleGetMyLabResults(context: ToolContext): Promise<ToolResult> {
  const patientId = await resolvePatientId(context);
  if (!patientId) return { success: false, data: null, error: "No patient profile linked to this account" };
  return handleGetPatientLabResults(patientId, "patient");
}

async function handleGetMyPrescriptions(context: ToolContext): Promise<ToolResult> {
  const patientId = await resolvePatientId(context);
  if (!patientId) return { success: false, data: null, error: "No patient profile linked to this account" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicine_orders")
    .select("id,visit_id,status,doctor_notes,created_at,completed_at,medicine_order_items(id,medicine_name_id,requested_quantity,dispensed_quantity,dosage_instructions,status,dispensed_at,medicine_names(name,category))")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return { success: false, data: null, error: error.message };
  return { success: true, data: { prescriptions: data, count: data?.length ?? 0 } };
}

async function handleGetMyAppointmentRequests(context: ToolContext): Promise<ToolResult> {
  const patientId = await resolvePatientId(context);
  if (!patientId) return { success: false, data: null, error: "No patient profile linked to this account" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointment_requests")
    .select("id,preferred_date,reason,status,admin_comment,reviewed_at,created_at,requested_department:departments!appointment_requests_requested_department_id_fkey(name)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return { success: false, data: null, error: error.message };
  return { success: true, data: { appointment_requests: data, count: data?.length ?? 0 } };
}
