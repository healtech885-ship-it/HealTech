import { AppShell } from "@/components/app-shell";
import { WorkspaceClient } from "@/components/workspace-client";
import { getCurrentProfile, requireRole } from "@/lib/auth/session";
import { getWorkspaceConfig } from "@/lib/workspaces";
import type { UserRole } from "@/types/app.types";

export async function RoleWorkspacePage({ role, segments }: { role: UserRole; segments?: string[] }) {
  await requireRole(role);
  const profile = await getCurrentProfile(role);
  if (!profile) return null;

  return (
    <AppShell role={role} profile={profile} segments={segments}>
      <WorkspaceClient config={getWorkspaceConfig(role, segments)} />
    </AppShell>
  );
}
