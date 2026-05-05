import { requireRole } from "@/lib/auth/session";

export default async function PharmacyLayout({ children }: { children: React.ReactNode }) {
  await requireRole("pharmacy");
  return children;
}
