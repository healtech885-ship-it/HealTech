import { createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "lab"], async ({ body, userId, supabase }) => {
  requireFields(body, ["results"]);
  const results = Array.isArray(body.results) ? body.results : [];
  if (results.length === 0) throw new Error("At least one result is required");

  const submitted = [];
  for (const result of results) {
    const id = result.lab_result_id ?? result.id ?? result.lab_order_item_id;
    if (!id) throw new Error("Missing lab result id");
    const { data, error } = await supabase.rpc("submit_lab_result_tx", {
      actor: userId,
      target_lab_result_id: id,
      target_result_value: result.result_value,
      target_result_notes: result.result_notes ?? null,
    });
    if (error) throw new Error(error.message);
    submitted.push(data);
  }
  return { submitted };
}));
