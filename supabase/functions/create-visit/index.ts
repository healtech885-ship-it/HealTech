import { createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "reception"], async ({ body, userId, supabase }) => {
  requireFields(body, ["patient_id", "doctor_id"]);

  const { data: visit, error } = await supabase.rpc("create_visit_tx", {
    actor: userId,
    target_patient_id: body.patient_id,
    target_doctor_id: body.doctor_id,
    target_chief_complaint: body.chief_complaint ?? null,
    target_priority: body.priority ?? "normal",
  });
  if (error) throw new Error(error.message);
  return visit;
}));
