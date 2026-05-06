import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

function requiredString(body: Record<string, unknown>, field: string) {
  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required field: ${field}`);
  }
  return value.trim();
}

function optionalString(body: Record<string, unknown>, field: string) {
  const value = body[field];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function requiredPositiveInteger(body: Record<string, unknown>, field: string) {
  const raw = body[field];
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
  return value;
}

function optionalNonNegativeNumber(body: Record<string, unknown>, field: string) {
  const raw = body[field];
  if (raw === undefined || raw === null || raw === "") return null;
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be greater than or equal to 0`);
  }
  return value;
}

Deno.serve(createRoleHandler(["admin"], async ({ body, userId, supabase }) => {
  requireFields(body, ["store_item_id", "quantity"]);

  const storeItemId = requiredString(body, "store_item_id");
  const quantity = requiredPositiveInteger(body, "quantity");
  const unitPrice = optionalNonNegativeNumber(body, "unit_price");
  const receiptNumber = optionalString(body, "receipt_number");

  const { data: storeItem, error: storeItemError } = await supabase
    .from("store_items")
    .select("id,status")
    .eq("id", storeItemId)
    .single();

  if (storeItemError || !storeItem) {
    throw new Error(storeItemError?.message ?? "Store item not found");
  }
  if (storeItem.status !== "active") {
    throw new Error("Store item must be active before stock can be added");
  }

  const { data: batch, error: batchError } = await supabase
    .from("store_item_batches")
    .insert({
      store_item_id: storeItemId,
      quantity,
      unit_price: unitPrice,
      receipt_number: receiptNumber,
      created_by: userId,
    })
    .select("id,store_item_id,quantity,unit_price,receipt_number,created_by,created_at")
    .single();

  if (batchError || !batch) {
    throw new Error(batchError?.message ?? "Failed to add store stock batch");
  }

  await audit(supabase, userId, "store_item_batch.created", "store_item_batch", batch.id, {
    store_item_id: storeItemId,
    quantity,
  });

  return batch;
}));
