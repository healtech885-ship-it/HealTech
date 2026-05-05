import { requireRole } from "@/lib/auth/guards";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  await requireRole("patient");
  return children;
}
