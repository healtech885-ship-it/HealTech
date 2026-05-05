import { requireRole } from "@/lib/auth/guards";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  await requireRole("doctor");
  return children;
}
