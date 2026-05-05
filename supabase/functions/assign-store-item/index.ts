import { createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin"], async ({ body, userId, supabase }) => {
  requireFields(body, ["store_item_id", "assigned_to", "quantity"]);
  const { data, error } = await supabase.rpc("assign_store_item_tx", {
    actor: userId,
    target_store_item_id: body.store_item_id,
    target_assigned_to: body.assigned_to,
    target_quantity: body.quantity,
    target_notes: body.notes ?? null,
  });
  if (error) throw new Error(error.message);
  return data;
}));
