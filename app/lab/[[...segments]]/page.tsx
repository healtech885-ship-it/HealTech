import { RoleWorkspacePage } from "@/components/role-workspace-page";

export default async function LabPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = await params;
  return <RoleWorkspacePage role="lab" segments={segments} />;
}
