import { createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "doctor"], async ({ body, userId, supabase }) => {
  requireFields(body, ["visit_id", "diagnosis"]);

  const { data, error } = await supabase.rpc("add_diagnosis_tx", {
    actor: userId,
    target_visit_id: body.visit_id,
    target_diagnosis: body.diagnosis,
    target_disease: body.disease ?? null,
    target_symptoms: body.symptoms ?? null,
    target_notes: body.notes ?? null,
    target_instructions: body.instructions ?? body.doctor_instructions ?? null,
    mark_completed: body.complete === true,
  });
  if (error) throw new Error(error.message);
  return data;
}));
