import { audit, createRoleHandler, requireFields } from "../_shared/handler.ts";

Deno.serve(createRoleHandler(["admin", "reception"], async ({ body, userId, role, supabase, userSupabase }) => {
  requireFields(body, ["patient_id", "email"]);

  if (role === "reception") {
    const { data: visiblePatient, error: visibleError } = await userSupabase
      .from("patients")
      .select("id")
      .eq("id", body.patient_id)
      .maybeSingle();

    if (visibleError || !visiblePatient) {
      throw new Error("Reception account cannot create portal access for this patient");
    }
  }

  const { data: patient, error: patientError } = await supabase.from("patients").select("*").eq("id", body.patient_id).single();
  if (patientError || !patient) throw new Error("Patient not found");
  if (patient.profile_id) throw new Error("Patient already has a portal account");

  const password = typeof body.password === "string" ? body.password : crypto.randomUUID();
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: String(body.email),
    password,
    email_confirm: true,
  });
  if (authError || !authUser.user) throw new Error(authError?.message ?? "Failed to create auth user");

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authUser.user.id,
    full_name: patient.full_name,
    email: String(body.email),
    phone: patient.phone,
    role: "patient",
  });
  if (profileError) throw new Error(profileError.message);

  const { error: linkError } = await supabase.from("patients").update({ profile_id: authUser.user.id }).eq("id", patient.id);
  if (linkError) throw new Error(linkError.message);

  await audit(supabase, userId, "patient_account.created", "patient", patient.id, { profile_id: authUser.user.id });
  return { patient_id: patient.id, profile_id: authUser.user.id, temporary_password: password };
}));
