import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "reception", "doctor", "lab", "pharmacy"], async ({ body, userId, supabase }) => {
  requireFields(body, ["store_item_id", "quantity"]);

  const { data, error } = await supabase.from("store_requests").insert({
    requested_by: body.requested_by ?? userId,
    store_item_id: body.store_item_id,
    quantity: body.quantity,
    reason: body.reason ?? null,
  }).select("id,status").single();

  if (error) throw new Error(error.message);
  await audit(supabase, userId, "store_request.created", "store_request", data.id, {
    store_item_id: body.store_item_id,
    quantity: body.quantity,
  });
  return data;
}));
