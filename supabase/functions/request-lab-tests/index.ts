import { createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "doctor"], async ({ body, userId, role, supabase }) => {
  requireFields(body, ["visit_id", "lab_test_ids", "target_lab_id"]);
  const labTestIds = Array.isArray(body.lab_test_ids) ? body.lab_test_ids : [];
  if (labTestIds.length === 0) throw new Error("At least one lab test is required");

  const { data: visit } = await supabase.from("visits").select("id,doctor_id,status").eq("id", body.visit_id).single();
  if (!visit) throw new Error("Visit not found");
  if (role !== "admin" && visit.doctor_id !== userId) throw new Error("Visit is not assigned to current doctor");
  if (["completed", "cancelled"].includes(visit.status)) throw new Error("Visit is closed");

  const { data, error } = await supabase.rpc("request_lab_tests_tx", {
    actor: userId,
    target_visit_id: visit.id,
    target_lab_test_ids: labTestIds,
    target_lab_id: body.target_lab_id,
    target_doctor_notes: body.doctor_notes ?? null,
  });
  if (error) throw new Error(error.message);
  return data;
}));
