import { createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "doctor"], async ({ body, userId, role, supabase }) => {
  requireFields(body, ["lab_result_ids"]);
  const ids = Array.isArray(body.lab_result_ids) ? body.lab_result_ids : Array.isArray(body.lab_order_item_ids) ? body.lab_order_item_ids : [];
  if (ids.length === 0) throw new Error("No lab result items selected");

  if (role !== "admin") {
    const { data: unauthorized } = await supabase
      .from("lab_results")
      .select("id,doctor_id")
      .in("id", ids)
      .neq("doctor_id", userId);
    if (unauthorized && unauthorized.length > 0) throw new Error("One or more results are not owned by current doctor");
  }

  const { data, error } = await supabase.rpc("approve_lab_result_tx", {
    actor: userId,
    target_lab_result_ids: ids,
  });
  if (error) throw new Error(error.message);
  return data;
}));
