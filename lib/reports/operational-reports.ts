export type DoctorReportRow = {
  doctorName: string;
  total: number;
};

export type LabTestReportRow = {
  testName: string;
  total: number;
};

export type MedicineReportRow = {
  medicineName: string;
  total: number;
};

export type StockRow = {
  medicineName: string;
  quantity: number;
};

export type OperationalReportData = {
  visits: {
    today: number;
    pending: number;
    completed: number;
    byDoctor: DoctorReportRow[];
  };
  lab: {
    pendingResults: number;
    completedResults: number;
    topTests: LabTestReportRow[];
  };
  pharmacy: {
    lowStockMedicines: number;
    expiredMedicines: number;
    stockLevels: StockRow[];
    topMedicines: MedicineReportRow[];
  };
  admin: {
    activeEmployees: number;
    pendingLeaveRequests: number;
    pendingStoreRequests: number;
    auditLogsToday: number;
  };
};

const emptyOperationalReport: OperationalReportData = {
  visits: { today: 0, pending: 0, completed: 0, byDoctor: [] },
  lab: { pendingResults: 0, completedResults: 0, topTests: [] },
  pharmacy: { lowStockMedicines: 0, expiredMedicines: 0, stockLevels: [], topMedicines: [] },
  admin: { activeEmployees: 0, pendingLeaveRequests: 0, pendingStoreRequests: 0, auditLogsToday: 0 },
};

export function normalizeOperationalReportData(raw: unknown): OperationalReportData {
  const record = objectValue(raw);
  const visits = objectValue(record.visits);
  const lab = objectValue(record.lab);
  const pharmacy = objectValue(record.pharmacy);
  const admin = objectValue(record.admin);

  return {
    visits: {
      today: numberValue(visits.today),
      pending: numberValue(visits.pending),
      completed: numberValue(visits.completed),
      byDoctor: doctorRows(visits.byDoctor ?? visits.by_doctor),
    },
    lab: {
      pendingResults: numberValue(lab.pendingResults ?? lab.pending_results),
      completedResults: numberValue(lab.completedResults ?? lab.completed_results),
      topTests: labTestRows(lab.topTests ?? lab.top_tests),
    },
    pharmacy: {
      lowStockMedicines: numberValue(pharmacy.lowStockMedicines ?? pharmacy.low_stock_medicines),
      expiredMedicines: numberValue(pharmacy.expiredMedicines ?? pharmacy.expired_medicines),
      stockLevels: stockRows(pharmacy.stockLevels ?? pharmacy.stock_levels),
      topMedicines: medicineRows(pharmacy.topMedicines ?? pharmacy.top_medicines),
    },
    admin: {
      activeEmployees: numberValue(admin.activeEmployees ?? admin.active_employees),
      pendingLeaveRequests: numberValue(admin.pendingLeaveRequests ?? admin.pending_leave_requests),
      pendingStoreRequests: numberValue(admin.pendingStoreRequests ?? admin.pending_store_requests),
      auditLogsToday: numberValue(admin.auditLogsToday ?? admin.audit_logs_today),
    },
  };
}

export function emptyOperationalReportData(): OperationalReportData {
  return structuredClone(emptyOperationalReport);
}

function doctorRows(value: unknown): DoctorReportRow[] {
  return arrayValue(value).map((row) => {
    const record = objectValue(row);
    return {
      doctorName: stringValue(record.doctorName ?? record.doctor_name ?? record.label ?? record.name, "Doctor"),
      total: numberValue(record.total),
    };
  });
}

function labTestRows(value: unknown): LabTestReportRow[] {
  return arrayValue(value).map((row) => {
    const record = objectValue(row);
    return {
      testName: stringValue(record.testName ?? record.test_name ?? record.label ?? record.name, "Lab test"),
      total: numberValue(record.total),
    };
  });
}

function medicineRows(value: unknown): MedicineReportRow[] {
  return arrayValue(value).map((row) => {
    const record = objectValue(row);
    return {
      medicineName: stringValue(record.medicineName ?? record.medicine_name ?? record.label ?? record.name, "Medicine"),
      total: numberValue(record.total),
    };
  });
}

function stockRows(value: unknown): StockRow[] {
  return arrayValue(value).map((row) => {
    const record = objectValue(row);
    return {
      medicineName: stringValue(record.medicineName ?? record.medicine_name ?? record.name, "Medicine"),
      quantity: numberValue(record.quantity),
    };
  });
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function numberValue(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
