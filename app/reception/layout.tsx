import { requireRole } from "@/lib/auth/session";

export default async function ReceptionLayout({ children }: { children: React.ReactNode }) {
  await requireRole("reception");
  return children;
}
