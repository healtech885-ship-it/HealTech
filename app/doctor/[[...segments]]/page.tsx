import { RoleWorkspacePage } from "@/components/role-workspace-page";

export default async function DoctorPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = await params;
  return <RoleWorkspacePage role="doctor" segments={segments} />;
}
