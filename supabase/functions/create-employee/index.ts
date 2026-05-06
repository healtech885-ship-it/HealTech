import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

const STAFF_ROLES = ["admin", "reception", "doctor", "lab", "pharmacy"] as const;
type StaffRole = typeof STAFF_ROLES[number];

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

function resolveStaffRole(value: unknown): StaffRole {
  if (typeof value !== "string" || !STAFF_ROLES.includes(value as StaffRole)) {
    throw new Error(`Role must be one of: ${STAFF_ROLES.join(", ")}`);
  }
  return value as StaffRole;
}

Deno.serve(createRoleHandler(["admin"], async ({ body, userId, supabase }) => {
  requireFields(body, ["full_name", "email", "role"]);

  const fullName = requiredString(body, "full_name");
  const email = requiredString(body, "email").toLowerCase();
  const role = resolveStaffRole(body.role);
  const password = optionalString(body, "password") ?? crypto.randomUUID();
  let createdAuthUserId: string | null = null;

  try {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
    });
    if (authError || !authUser.user) throw new Error(authError?.message ?? "Failed to create auth user");
    createdAuthUserId = authUser.user.id;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: createdAuthUserId,
      full_name: fullName,
      email,
      phone: optionalString(body, "phone"),
      role,
      status: "active",
    });
    if (profileError) throw new Error(profileError.message);

    const { data: employee, error: employeeError } = await supabase.from("employees").insert({
      profile_id: createdAuthUserId,
      department_id: optionalString(body, "department_id"),
      job_title: optionalString(body, "job_title"),
      employee_code: optionalString(body, "employee_code"),
      hire_date: optionalString(body, "hire_date"),
      status: "active",
    }).select("id").single();
    if (employeeError) throw new Error(employeeError.message);

    await audit(supabase, userId, "employee.created", "employee", employee.id, {
      profile_id: createdAuthUserId,
      role,
      department_id: optionalString(body, "department_id"),
    });

    return { employee_id: employee.id, profile_id: createdAuthUserId, temporary_password: password };
  } catch (error) {
    if (createdAuthUserId) {
      await supabase.from("employees").delete().eq("profile_id", createdAuthUserId);
      await supabase.from("profiles").delete().eq("id", createdAuthUserId);
      await supabase.auth.admin.deleteUser(createdAuthUserId);
    }
    throw error;
  }
}));
