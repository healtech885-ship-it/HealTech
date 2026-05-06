import { PatientShell } from "@/components/patient/patient-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function PatientPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = await params;
  const profile = await requireRole("patient");

  return <PatientShell profile={profile} segments={segments} />;
}
