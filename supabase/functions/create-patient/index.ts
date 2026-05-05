import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "reception"], async ({ body, userId, supabase }) => {
  requireFields(body, ["full_name"]);
  if (!body.student_id && !body.mrn) throw new Error("Student ID or MRN is required");

  const { data, error } = await supabase.from("patients").insert({
    full_name: body.full_name,
    student_id: body.student_id ?? null,
    mrn: body.mrn ?? null,
    gender: body.gender ?? null,
    birth_date: body.birth_date ?? null,
    department_id: body.department_id ?? null,
    dorm_info: body.dorm_info ?? null,
    phone: body.phone ?? null,
    emergency_phone: body.emergency_phone ?? null,
    nationality: body.nationality ?? null,
    blood_type: body.blood_type ?? null,
    address: body.address ?? null,
    created_by: userId,
  }).select("id,full_name,mrn,student_id").single();

  if (error) throw new Error(error.message);
  await audit(supabase, userId, "patient.created", "patient", data.id, { mrn: data.mrn, student_id: data.student_id });
  return data;
}));
