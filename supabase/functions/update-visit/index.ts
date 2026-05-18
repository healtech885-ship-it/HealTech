import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "doctor"], async ({ body, userId, role, supabase }) => {
  requireFields(body, ["visit_id"]);

  const { data: visit } = await supabase
    .from("visits")
    .select("id,doctor_id,status,diagnosis,doctor_instructions")
    .eq("id", body.visit_id)
    .single();

  if (!visit) throw new Error("Visit not found");
  if (role !== "admin" && visit.doctor_id !== userId) throw new Error("Visit is not assigned to current doctor");
  if (["completed", "cancelled"].includes(visit.status)) throw new Error("Completed or cancelled visits cannot be edited");

  const payload: Record<string, unknown> = {};
  for (const field of ["chief_complaint", "symptoms", "diagnosis", "disease", "doctor_instructions", "notes", "priority"]) {
    if (body[field] !== undefined) payload[field] = body[field];
  }
  if (body.status === "in_progress") payload.status = "in_progress";
  if (Object.keys(payload).length === 0 && body.complete !== true) throw new Error("No visit fields supplied");

  if (body.complete === true) {
    const diagnosis = body.diagnosis !== undefined ? body.diagnosis : visit.diagnosis;
    const doctorInstructions = body.doctor_instructions !== undefined ? body.doctor_instructions : visit.doctor_instructions;

    if (typeof diagnosis !== "string" || diagnosis.trim().length === 0) {
      throw new Error("Diagnosis is required before completing visit");
    }
    if (typeof doctorInstructions !== "string" || doctorInstructions.trim().length === 0) {
      throw new Error("Doctor instructions are required before completing visit");
    }
  }

  let data: { id: string; status: string } = { id: body.visit_id, status: visit.status };
  if (Object.keys(payload).length > 0) {
    const { data: updated, error } = await supabase
      .from("visits")
      .update(payload)
      .eq("id", body.visit_id)
      .select("id,status")
      .single();
    if (error) throw new Error(error.message);
    data = updated;
  }

  if (body.complete === true) {
    const { data: completed, error: completeError } = await supabase.rpc("complete_visit", {
      target_visit_id: body.visit_id,
      actor: userId,
    });
    if (completeError) throw new Error(completeError.message);
    return completed;
  }

  await audit(supabase, userId, "visit.updated", "visit", data.id, payload);
  return data;
}));
