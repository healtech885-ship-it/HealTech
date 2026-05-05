import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "reception", "doctor", "lab", "pharmacy"], async ({ body, userId, supabase }) => {
  requireFields(body, ["leave_type", "start_date", "end_date", "reason"]);

  const { data, error } = await supabase.from("leave_requests").insert({
    employee_profile_id: body.employee_profile_id ?? userId,
    leave_type: body.leave_type,
    start_date: body.start_date,
    end_date: body.end_date,
    reason: body.reason,
  }).select("id,status").single();

  if (error) throw new Error(error.message);
  await audit(supabase, userId, "leave_request.created", "leave_request", data.id);
  return data;
}));
