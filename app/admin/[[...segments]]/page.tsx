import { RoleWorkspacePage } from "@/components/role-workspace-page";

export default async function AdminPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = await params;
  return <RoleWorkspacePage role="admin" segments={segments} />;
}
