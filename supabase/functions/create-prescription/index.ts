import { createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "doctor"], async ({ body, userId, role, supabase }) => {
  requireFields(body, ["visit_id", "items", "target_pharmacy_id"]);
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) throw new Error("At least one medicine is required");

  const { data: visit } = await supabase.from("visits").select("id,doctor_id,status").eq("id", body.visit_id).single();
  if (!visit) throw new Error("Visit not found");
  if (role !== "admin" && visit.doctor_id !== userId) throw new Error("Visit is not assigned to current doctor");
  if (["completed", "cancelled"].includes(visit.status)) throw new Error("Visit is closed");

  const canonicalItems = items.map((item) => ({
    ...item,
    medicine_id: item.medicine_id ?? item.medicine_name_id,
  }));

  const { data, error } = await supabase.rpc("create_prescription_tx", {
    actor: userId,
    target_visit_id: visit.id,
    target_items: canonicalItems,
    target_pharmacy_id: body.target_pharmacy_id,
    target_doctor_notes: body.doctor_notes ?? null,
  });
  if (error) throw new Error(error.message);
  return data;
}));
