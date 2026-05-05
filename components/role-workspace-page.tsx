import { AppShell } from "@/components/app-shell";
import { WorkspaceClient } from "@/components/workspace-client";
import { requireRole } from "@/lib/auth/guards";
import { getWorkspaceConfig } from "@/lib/workspaces";
import type { UserRole } from "@/types/app.types";

export async function RoleWorkspacePage({ role, segments }: { role: UserRole; segments?: string[] }) {
  const profile = await requireRole(role);

  return (
    <AppShell role={role} profile={profile} segments={segments}>
      <WorkspaceClient config={getWorkspaceConfig(role, segments)} />
    </AppShell>
  );
}
