import { requireRole } from "@/lib/auth/guards";

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  await requireRole("lab");
  return children;
}
