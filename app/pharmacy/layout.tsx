import { requireRole } from "@/lib/auth/guards";

export default async function PharmacyLayout({ children }: { children: React.ReactNode }) {
  await requireRole("pharmacy");
  return children;
}
