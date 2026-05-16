export type RealtimeWorkspaceConfig = {
  table: string;
  mode?: string;
  dashboard?: boolean;
};

const REPORT_SOURCE_TABLES = [
  "audit_logs",
  "visits",
  "patients",
  "employees",
  "leave_requests",
  "lab_orders",
  "lab_order_items",
  "lab_results",
  "medicine_orders",
  "medicine_order_items",
  "prescriptions",
  "prescription_items",
  "medicine_batches",
  "store_requests",
] as const;

export const REALTIME_TABLES_BY_WORKSPACE_TABLE: Record<string, readonly string[]> = {
  appointment_requests: ["appointment_requests", "visits"],
  audit_logs: ["audit_logs"],
  departments: ["departments"],
  employees: ["employees", "profiles"],
  lab_order_items: ["lab_order_items", "lab_orders", "visits"],
  lab_orders: ["lab_orders", "lab_order_items", "visits"],
  lab_results: ["lab_results", "visits"],
  lab_tests: ["lab_tests"],
  leave_requests: ["leave_requests"],
  medicine_batches: ["medicine_batches"],
  medicine_names: ["medicine_names", "medicine_batches"],
  medicine_order_items: ["medicine_order_items", "medicine_orders", "medicine_batches"],
  medicine_orders: ["medicine_orders", "medicine_order_items", "medicine_batches"],
  patients: ["patients", "visits"],
  prescription_items: ["prescription_items", "prescriptions", "medicine_batches"],
  prescriptions: ["prescriptions", "prescription_items", "medicine_batches"],
  profiles: ["profiles", "employees"],
  store_assignments: ["store_assignments", "store_item_batches"],
  store_item_batches: ["store_item_batches", "store_items"],
  store_items: ["store_items", "store_item_batches"],
  store_requests: ["store_requests", "store_assignments"],
  visits: ["visits"],
};

export function getRealtimeTablesForWorkspace(config: RealtimeWorkspaceConfig) {
  const tables = config.mode === "reports"
    ? REPORT_SOURCE_TABLES
    : REALTIME_TABLES_BY_WORKSPACE_TABLE[config.table] ?? [config.table];

  return uniqueTables(tables);
}

export function realtimeChannelName(tables: readonly string[]) {
  return `workspace:${uniqueTables(tables).sort().join(",")}`;
}

function uniqueTables(tables: readonly string[]) {
  return Array.from(new Set(tables.map((table) => table.trim()).filter(Boolean)));
}
