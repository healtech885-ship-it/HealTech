import { DoctorShell } from "@/components/doctor/doctor-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function DoctorPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = await params;
  const profile = await requireRole("doctor");

  return <DoctorShell profile={profile} segments={segments} />;
}
