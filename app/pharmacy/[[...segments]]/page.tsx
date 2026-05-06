import { PharmacyShell } from "@/components/pharmacy/pharmacy-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function PharmacyPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = await params;
  const profile = await requireRole("pharmacy");

  return <PharmacyShell profile={profile} segments={segments} />;
}
