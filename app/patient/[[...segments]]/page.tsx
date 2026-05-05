import { RoleWorkspacePage } from "@/components/role-workspace-page";

export default async function PatientPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = await params;
  return <RoleWorkspacePage role="patient" segments={segments} />;
}
