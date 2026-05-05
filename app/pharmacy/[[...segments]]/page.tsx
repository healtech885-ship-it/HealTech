import { RoleWorkspacePage } from "@/components/role-workspace-page";

export default async function PharmacyPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = await params;
  return <RoleWorkspacePage role="pharmacy" segments={segments} />;
}
