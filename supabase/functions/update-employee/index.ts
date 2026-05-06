import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

const STAFF_ROLES = ["admin", "reception", "doctor", "lab", "pharmacy"] as const;
const PROFILE_STATUSES = ["active", "inactive", "suspended"] as const;
const EMPLOYEE_STATUSES = ["active", "inactive", "on_leave", "terminated"] as const;

type StaffRole = typeof STAFF_ROLES[number];
type ProfileStatus = typeof PROFILE_STATUSES[number];
type EmployeeStatus = typeof EMPLOYEE_STATUSES[number];

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

function optionalDateString(body: Record<string, unknown>, field: string) {
  const value = optionalString(body, field);
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${field} must be a YYYY-MM-DD date`);
  }
  return value;
}

function resolveStaffRole(value: unknown): StaffRole {
  if (typeof value !== "string" || !STAFF_ROLES.includes(value as StaffRole)) {
    throw new Error(`Role must be one of: ${STAFF_ROLES.join(", ")}`);
  }
  return value as StaffRole;
}

function resolveProfileStatus(value: unknown): ProfileStatus {
  if (typeof value !== "string" || !PROFILE_STATUSES.includes(value as ProfileStatus)) {
    throw new Error(`Account status must be one of: ${PROFILE_STATUSES.join(", ")}`);
  }
  return value as ProfileStatus;
}

function resolveEmployeeStatus(value: unknown): EmployeeStatus {
  if (typeof value !== "string" || !EMPLOYEE_STATUSES.includes(value as EmployeeStatus)) {
    throw new Error(`Employee status must be one of: ${EMPLOYEE_STATUSES.join(", ")}`);
  }
  return value as EmployeeStatus;
}

Deno.serve(createRoleHandler(["admin"], async ({ body, userId, supabase }) => {
  requireFields(body, ["employee_id", "full_name", "role", "profile_status", "employee_status"]);

  const employeeId = requiredString(body, "employee_id");
  const fullName = requiredString(body, "full_name");
  const role = resolveStaffRole(body.role);
  const profileStatus = resolveProfileStatus(body.profile_status);
  const employeeStatus = resolveEmployeeStatus(body.employee_status);

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id,profile_id,department_id,job_title,employee_code,hire_date,status")
    .eq("id", employeeId)
    .single();

  if (employeeError || !employee) {
    throw new Error(employeeError?.message ?? "Employee not found");
  }

  const profileUpdate = {
    full_name: fullName,
    phone: optionalString(body, "phone"),
    role,
    status: profileStatus,
  };

  const employeeUpdate = {
    department_id: optionalString(body, "department_id"),
    job_title: optionalString(body, "job_title"),
    employee_code: optionalString(body, "employee_code"),
    hire_date: optionalDateString(body, "hire_date"),
    status: employeeStatus,
  };

  const { data: updatedEmployee, error: updateError } = await supabase
    .from("employees")
    .update(employeeUpdate)
    .eq("id", employeeId)
    .select("id,profile_id,department_id,job_title,employee_code,hire_date,status,created_at")
    .single();

  if (updateError || !updatedEmployee) {
    throw new Error(updateError?.message ?? "Failed to update employee");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", employee.profile_id)
    .select("id,full_name,email,phone,role,status")
    .single();

  if (profileError || !profile) {
    await supabase.from("employees").update({
      department_id: employee.department_id,
      job_title: employee.job_title,
      employee_code: employee.employee_code,
      hire_date: employee.hire_date,
      status: employee.status,
    }).eq("id", employeeId);
    throw new Error(profileError?.message ?? "Failed to update employee profile");
  }

  await audit(supabase, userId, "employee.updated", "employee", employeeId, {
    profile_id: employee.profile_id,
    updated_fields: {
      profiles: Object.keys(profileUpdate),
      employees: Object.keys(employeeUpdate),
    },
  });

  return {
    employee: updatedEmployee,
    profile,
  };
}));
