export type UserRole = "admin" | "reception" | "doctor" | "lab" | "pharmacy" | "patient";

export type UserStatus = "active" | "inactive" | "suspended";

export type AppProfile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export type ModuleRecord = Record<string, unknown>;
