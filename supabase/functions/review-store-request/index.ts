import { createRoleHandler, requireFields } from "../_shared/handler.ts";

const DECISIONS = ["approved", "rejected", "fulfilled"] as const;
type Decision = typeof DECISIONS[number];

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

function resolveDecision(value: unknown): Decision {
  if (typeof value !== "string" || !DECISIONS.includes(value as Decision)) {
    throw new Error(`Decision must be one of: ${DECISIONS.join(", ")}`);
  }
  return value as Decision;
}

Deno.serve(createRoleHandler(["admin"], async ({ body, userId, supabase }) => {
  requireFields(body, ["store_request_id", "decision"]);

  const storeRequestId = requiredString(body, "store_request_id");
  const decision = resolveDecision(body.decision);

  const { data, error } = await supabase.rpc("review_store_request_tx", {
    actor: userId,
    target_store_request_id: storeRequestId,
    target_decision: decision,
    target_admin_comment: optionalString(body, "admin_comment"),
    target_notes: optionalString(body, "notes"),
  });

  if (error) throw new Error(error.message);
  return data;
}));
