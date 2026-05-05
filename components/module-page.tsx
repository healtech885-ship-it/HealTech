import { WorkspaceClient } from "@/components/workspace-client";
import { getWorkspaceConfig } from "@/lib/workspaces";
import type { UserRole } from "@/types/app.types";

export function ModulePage({ role, segments }: { role: UserRole; segments?: string[] }) {
  const config = getWorkspaceConfig(role, segments);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.02em] text-primary">{config.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold leading-[38px] text-[var(--on-surface)]">{config.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--on-surface-variant)]">{config.description}</p>
        </div>
      </section>
      <WorkspaceClient config={config} />
    </div>
  );
}
