import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

const SETTINGS_KEY = "general";
const LAB_VISIBILITY_MODES = ["doctor_approved_only", "lab_submitted_visible", "admin_controlled"] as const;

type LabVisibilityMode = typeof LAB_VISIBILITY_MODES[number];

function requiredString(body: Record<string, unknown>, field: string) {
  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required field: ${field}`);
  }
  return value.trim();
}

function optionalString(body: Record<string, unknown>, field: string) {
  const value = body[field];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : "";
}

function optionalEmail(body: Record<string, unknown>, field: string) {
  const value = optionalString(body, field);
  if (!value) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error(`${field} must be a valid email address`);
  }
  return value.toLowerCase();
}

function requiredTime(body: Record<string, unknown>, field: string) {
  const value = requiredString(body, field);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error(`${field} must be a valid HH:MM time`);
  }
  return value;
}

function requiredDuration(body: Record<string, unknown>, field: string) {
  const raw = body[field];
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isInteger(value) || value < 5 || value > 240) {
    throw new Error(`${field} must be a whole number between 5 and 240`);
  }
  return value;
}

function requiredBoolean(body: Record<string, unknown>, field: string) {
  const value = body[field];
  if (typeof value !== "boolean") {
    throw new Error(`${field} must be true or false`);
  }
  return value;
}

function requiredLabVisibilityMode(value: unknown): LabVisibilityMode {
  if (typeof value !== "string" || !LAB_VISIBILITY_MODES.includes(value as LabVisibilityMode)) {
    throw new Error(`lab_results_visibility_mode must be one of: ${LAB_VISIBILITY_MODES.join(", ")}`);
  }
  return value as LabVisibilityMode;
}

Deno.serve(createRoleHandler(["admin"], async ({ body, userId, supabase }) => {
  requireFields(body, [
    "clinic_name",
    "working_hours_start",
    "working_hours_end",
    "default_appointment_duration_minutes",
    "allow_patient_appointment_requests",
    "lab_results_visibility_mode",
  ]);

  const workingHoursStart = requiredTime(body, "working_hours_start");
  const workingHoursEnd = requiredTime(body, "working_hours_end");
  if (workingHoursStart === workingHoursEnd) {
    throw new Error("working_hours_end must be different from working_hours_start");
  }

  const value = {
    clinic_name: requiredString(body, "clinic_name"),
    clinic_phone: optionalString(body, "clinic_phone"),
    clinic_email: optionalEmail(body, "clinic_email"),
    clinic_address: optionalString(body, "clinic_address"),
    working_hours_start: workingHoursStart,
    working_hours_end: workingHoursEnd,
    default_appointment_duration_minutes: requiredDuration(body, "default_appointment_duration_minutes"),
    allow_patient_appointment_requests: requiredBoolean(body, "allow_patient_appointment_requests"),
    emergency_contact_number: optionalString(body, "emergency_contact_number"),
    lab_results_visibility_mode: requiredLabVisibilityMode(body.lab_results_visibility_mode),
  };

  const { data, error } = await supabase
    .from("clinic_settings")
    .upsert({
      key: SETTINGS_KEY,
      value,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" })
    .select("key,value,updated_by,updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update clinic settings");
  }

  await audit(supabase, userId, "clinic_settings.updated", "clinic_settings", null, {
    key: SETTINGS_KEY,
  });

  return data;
}));
