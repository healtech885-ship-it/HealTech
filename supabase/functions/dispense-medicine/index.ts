import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "pharmacy"], async ({ body, userId, supabase }) => {
  requireFields(body, ["prescription_item_id", "quantity"]);
  const itemId = body.prescription_item_id ?? body.medicine_order_item_id;
  const { data, error } = await supabase.rpc("dispense_prescription_item_tx", {
    target_item_id: itemId,
    quantity_to_dispense: body.quantity,
    actor: userId,
  });
  if (error) throw new Error(error.message);

  await audit(supabase, userId, "medicine.dispensed", "prescription_item", String(itemId), {
    quantity: body.quantity,
  });
  return data;
}));
