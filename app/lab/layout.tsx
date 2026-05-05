import { requireRole } from "@/lib/auth/session";

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  await requireRole("lab");
  return children;
}
