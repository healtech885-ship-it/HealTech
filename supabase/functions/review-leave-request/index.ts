import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin"], async ({ body, userId, supabase }) => {
  requireFields(body, ["leave_request_id", "status"]);
  if (!["approved", "rejected"].includes(String(body.status))) throw new Error("Status must be approved or rejected");

  const { data, error } = await supabase.from("leave_requests").update({
    status: body.status,
    admin_comment: body.admin_comment ?? null,
    reviewed_by: userId,
    reviewed_at: new Date().toISOString(),
  }).eq("id", body.leave_request_id).select("id,status").single();
  if (error) throw new Error(error.message);

  await audit(supabase, userId, `leave_request.${data.status}`, "leave_request", data.id);
  return data;
}));
