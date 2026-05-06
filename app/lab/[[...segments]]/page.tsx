import { LabShell } from "@/components/lab/lab-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function LabPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = await params;
  const profile = await requireRole("lab");

  return <LabShell profile={profile} segments={segments} />;
}
