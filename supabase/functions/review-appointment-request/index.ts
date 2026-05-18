import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

const DECISIONS = ["approved", "rejected", "converted_to_visit"] as const;
const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

type Decision = typeof DECISIONS[number];
type Priority = typeof PRIORITIES[number];

function optionalString(body: Record<string, unknown>, field: string) {
  const value = body[field];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function decisionValue(value: unknown): Decision {
  if (typeof value !== "string" || !DECISIONS.includes(value as Decision)) {
    throw new Error(`Decision must be one of: ${DECISIONS.join(", ")}`);
  }
  return value as Decision;
}

function priorityValue(value: unknown): Priority {
  if (value === undefined || value === null || value === "") return "normal";
  if (typeof value !== "string" || !PRIORITIES.includes(value as Priority)) {
    throw new Error(`Priority must be one of: ${PRIORITIES.join(", ")}`);
  }
  return value as Priority;
}

Deno.serve(createRoleHandler(["admin", "reception"], async ({ body, userId, role, supabase }) => {
  requireFields(body, ["appointment_request_id", "decision"]);

  const appointmentRequestId = String(body.appointment_request_id);
  const decision = decisionValue(body.decision);
  const adminComment = optionalString(body, "admin_comment");

  const { data: request, error: requestError } = await supabase
    .from("appointment_requests")
    .select("id,patient_id,requested_department_id,preferred_date,reason,status,admin_comment")
    .eq("id", appointmentRequestId)
    .single();

  if (requestError || !request) throw new Error("Appointment request not found");

  if (role === "reception") {
    const { data: canAccess, error: accessError } = await supabase.rpc("reception_can_access_appointment_request", {
      target_request_id: appointmentRequestId,
      actor: userId,
    });
    if (accessError) throw new Error(accessError.message);
    if (!canAccess) throw new Error("Reception account is not assigned to this appointment request");
  }

  const metadata = {
    appointment_request_id: request.id,
    patient_id: request.patient_id,
    requested_department_id: request.requested_department_id,
    preferred_date: request.preferred_date,
  };

  if (decision === "approved" || decision === "rejected") {
    if (request.status !== "pending") {
      throw new Error(`Only pending requests can be ${decision}`);
    }

    const { data, error } = await supabase
      .from("appointment_requests")
      .update({
        status: decision,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        admin_comment: adminComment,
      })
      .eq("id", appointmentRequestId)
      .select("id,status,reviewed_by,reviewed_at,admin_comment")
      .single();

    if (error) throw new Error(error.message);

    await audit(
      supabase,
      userId,
      decision === "approved" ? "appointment_request.approved" : "appointment_request.rejected",
      "appointment_request",
      appointmentRequestId,
      { ...metadata, admin_comment: adminComment },
    );

    return data;
  }

  if (request.status !== "approved") {
    throw new Error("Only approved appointment requests can be converted to a visit");
  }

  requireFields(body, ["doctor_id"]);

  const chiefComplaint = optionalString(body, "chief_complaint") ?? request.reason ?? null;
  const priority = priorityValue(body.priority);

  const { data: visit, error: visitError } = await supabase.rpc("create_visit_tx", {
    actor: userId,
    target_patient_id: request.patient_id,
    target_doctor_id: body.doctor_id,
    target_chief_complaint: chiefComplaint,
    target_priority: priority,
  });

  if (visitError) throw new Error(visitError.message);

  const { data: updatedRequest, error: updateError } = await supabase
    .from("appointment_requests")
    .update({
      status: "completed",
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      admin_comment: adminComment ?? request.admin_comment,
    })
    .eq("id", appointmentRequestId)
    .select("id,status,reviewed_by,reviewed_at,admin_comment")
    .single();

  if (updateError) throw new Error(updateError.message);

  await audit(supabase, userId, "appointment_request.converted_to_visit", "appointment_request", appointmentRequestId, {
    ...metadata,
    doctor_id: body.doctor_id,
    priority,
    chief_complaint: chiefComplaint,
    visit,
  });

  return { request: updatedRequest, visit };
}));
