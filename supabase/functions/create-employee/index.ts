import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin"], async ({ body, userId, supabase }) => {
  requireFields(body, ["full_name", "email", "role"]);

  const password = typeof body.password === "string" ? body.password : crypto.randomUUID();
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: String(body.email),
    password,
    email_confirm: true,
  });
  if (authError || !authUser.user) throw new Error(authError?.message ?? "Failed to create auth user");

  const profile = {
    id: authUser.user.id,
    full_name: String(body.full_name),
    email: String(body.email),
    phone: typeof body.phone === "string" ? body.phone : null,
    role: body.role,
  };
  const { error: profileError } = await supabase.from("profiles").insert(profile);
  if (profileError) throw new Error(profileError.message);

  const { data: employee, error: employeeError } = await supabase.from("employees").insert({
    profile_id: authUser.user.id,
    department_id: body.department_id ?? null,
    job_title: body.job_title ?? null,
    employee_code: body.employee_code ?? null,
    hire_date: body.hire_date ?? null,
  }).select("id").single();
  if (employeeError) throw new Error(employeeError.message);

  await audit(supabase, userId, "employee.created", "employee", employee.id, { profile_id: authUser.user.id });
  return { employee_id: employee.id, profile_id: authUser.user.id, temporary_password: password };
}));
