import { RoleWorkspacePage } from "@/components/role-workspace-page";

export default async function ReceptionPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = await params;
  return <RoleWorkspacePage role="reception" segments={segments} />;
}
