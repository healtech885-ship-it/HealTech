import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

const GENDERS = ["male", "female"] as const;

type Gender = typeof GENDERS[number];

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

function optionalGender(value: unknown): Gender | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !GENDERS.includes(value as Gender)) {
    throw new Error(`Gender must be one of: ${GENDERS.join(", ")}`);
  }
  return value as Gender;
}

function optionalPastOrTodayDate(body: Record<string, unknown>, field: string) {
  const value = optionalString(body, field);
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`${field} must be a valid date`);
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);
  if (date > today) throw new Error(`${field} cannot be in the future`);
  return value;
}

Deno.serve(createRoleHandler(["admin", "reception"], async ({ body, userId, supabase }) => {
  requireFields(body, ["full_name"]);

  const fullName = requiredString(body, "full_name");
  const studentId = optionalString(body, "student_id");
  const mrn = optionalString(body, "mrn");
  if (!studentId && !mrn) throw new Error("Student ID or MRN is required");

  const { data, error } = await supabase.from("patients").insert({
    full_name: fullName,
    student_id: studentId,
    mrn,
    gender: optionalGender(body.gender),
    birth_date: optionalPastOrTodayDate(body, "birth_date"),
    department_id: optionalString(body, "department_id"),
    dorm_info: optionalString(body, "dorm_info"),
    phone: optionalString(body, "phone"),
    emergency_phone: optionalString(body, "emergency_phone"),
    nationality: optionalString(body, "nationality"),
    blood_type: optionalString(body, "blood_type"),
    address: optionalString(body, "address"),
    status: "active",
    created_by: userId,
  }).select("id,full_name,mrn,student_id").single();

  if (error) throw new Error(error.message);
  await audit(supabase, userId, "patient.created", "patient", data.id, { mrn: data.mrn, student_id: data.student_id });
  return data;
}));
